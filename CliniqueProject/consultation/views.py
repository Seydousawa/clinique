from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Consultation
from .serializer import ConsultationSerializer, ConsultationListSerializer


class ConsultationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les consultations (CRUD complet).
    
    Endpoints disponibles:
    - GET /consultations/ : Liste des consultations actives
    - GET /consultations/?include_deleted=true : Toutes les consultations
    - GET /consultations/{id}/ : Détail d'une consultation
    - POST /consultations/ : Créer une consultation
    - PUT/PATCH /consultations/{id}/ : Modifier une consultation
    - DELETE /consultations/{id}/ : Supprimer définitivement
    - POST /consultations/{id}/archive/ : Archiver
    - POST /consultations/{id}/restore/ : Restaurer
    - GET /consultations/archived/ : Liste des archivées
    - GET /consultations/search/?q=... : Recherche
    """
    
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    # permission_classes = [IsAuthenticated]  # Décommentez si vous utilisez l'authentification
    
    def get_serializer_class(self):
        """Utilise un serializer allégé pour les listes"""
        if self.action == 'list':
            return ConsultationListSerializer
        return ConsultationSerializer
    
    def get_queryset(self):
        """
        Retourne les consultations avec optimisation des requêtes.
        Paramètres de requête:
        - include_deleted: true/false (défaut: false)
        - patient_id: filtrer par patient
        - medecin_id: filtrer par médecin
        """
        queryset = Consultation.objects.select_related('patient', 'medecin')
        
        # Filtrer par statut de suppression
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower()
        if include_deleted != 'true':
            queryset = queryset.filter(is_deleted=False)
        
        # Filtrer par patient
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrer par médecin
        medecin_id = self.request.query_params.get('medecin_id')
        if medecin_id:
            queryset = queryset.filter(medecin_id=medecin_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Créer une nouvelle consultation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Consultation créée avec succès',
                'consultation': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Mettre à jour une consultation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Empêcher la modification d'une consultation archivée
        if instance.is_deleted:
            return Response(
                {'error': 'Impossible de modifier une consultation archivée. Veuillez la restaurer d\'abord.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Consultation mise à jour avec succès',
            'consultation': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Suppression définitive (à utiliser avec précaution)"""
        instance = self.get_object()
        instance.delete()
        return Response(
            {'message': 'Consultation supprimée définitivement'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archiver une consultation (soft delete)"""
        consultation = self.get_object()
        
        if consultation.is_deleted:
            return Response(
                {'error': 'Cette consultation est déjà archivée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consultation.soft_delete()
        serializer = self.get_serializer(consultation)
        
        return Response({
            'message': 'Consultation archivée avec succès',
            'consultation': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaurer une consultation archivée"""
        consultation = self.get_object()
        
        if not consultation.is_deleted:
            return Response(
                {'error': 'Cette consultation n\'est pas archivée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consultation.restore()
        serializer = self.get_serializer(consultation)
        
        return Response({
            'message': 'Consultation restaurée avec succès',
            'consultation': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def archived(self, request):
        """Récupérer uniquement les consultations archivées"""
        archived = Consultation.all_objects.filter(is_deleted=True).select_related('patient', 'medecin')
        
        page = self.paginate_queryset(archived)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(archived, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Recherche dans les consultations.
        Paramètre: ?q=terme_de_recherche
        """
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response(
                {'error': 'Veuillez fournir un terme de recherche (paramètre q)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consultations = Consultation.objects.filter(
            Q(patient__nom__icontains=query) |
            Q(patient__prenom__icontains=query) |
            Q(medecin__nom__icontains=query) |
            Q(medecin__prenom__icontains=query) |
            Q(symptome__icontains=query) |
            Q(diagnostic__icontains=query)
        ).select_related('patient', 'medecin').distinct()
        
        page = self.paginate_queryset(consultations)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(consultations, many=True)
        return Response(serializer.data)