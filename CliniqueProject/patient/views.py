from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .serializerpatient import PatientSerializer, PatientResumeSerializer
from .models import Patient


class PatientViewSet(viewsets.ModelViewSet):
    """CRUD pour les patients avec soft delete"""
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sexe', 'groupe_sanguin']
    search_fields = ['nom', 'prenom', 'telephone', 'email']
    ordering_fields = ['nom', 'prenom', 'date_naissance']
    ordering = ['nom', 'prenom']
    
    def get_queryset(self):
        """
        Retourne la liste des patients selon le paramètre 'status'
        - ?status=active (par défaut) : patients actifs
        - ?status=archived : patients archivés
        - ?status=all : tous les patients
        """
        status_filter = self.request.query_params.get('status', 'active')
        
        if status_filter == 'archived':
            return Patient.objects.deleted_only()
        elif status_filter == 'all':
            return Patient.all_objects.all()
        else:  # 'active' par défaut
            return Patient.objects.all()
    
    def get_object(self):
        """
        Surcharge pour permettre la récupération d'objets archivés
        lors des actions restore et permanent_delete
        """
        if self.action in ['restore', 'permanent_delete']:
            # Pour ces actions, on utilise le manager qui inclut tous les objets
            queryset = Patient.all_objects.all()
        else:
            queryset = self.filter_queryset(self.get_queryset())
        
        # Récupération de l'objet
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)
        
        # Vérification des permissions
        self.check_object_permissions(self.request, obj)
        
        return obj
    
    def get_serializer_class(self):
        """Utiliser le serializer résumé pour la liste"""
        if self.action == 'list':
            return PatientResumeSerializer
        return PatientSerializer
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete (archivage) au lieu de la suppression définitive"""
        patient = self.get_object()
        patient.soft_delete()
        
        return Response(
            {
                'message': f'Le patient {patient.prenom} {patient.nom} a été archivé avec succès.',
                'id': patient.id
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Endpoint personnalisé pour restaurer un patient archivé
        URL: /api/patients/{id}/restore/
        """
        patient = self.get_object()
        
        if not patient.is_deleted:
            return Response(
                {'error': 'Ce patient n\'est pas archivé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        patient.restore()
        
        return Response(
            {
                'message': f'Le patient {patient.prenom} {patient.nom} a été restauré avec succès.',
                'patient': PatientSerializer(patient).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def archived(self, request):
        """
        Endpoint pour obtenir uniquement les patients archivés
        URL: /api/patients/archived/
        """
        archived_patients = Patient.objects.deleted_only()
        serializer = self.get_serializer(archived_patients, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """
        Suppression définitive (ATTENTION: irréversible)
        URL: /api/patients/{id}/permanent_delete/
        """
        patient = self.get_object()
        patient_info = f"{patient.prenom} {patient.nom}"
        patient.delete()  # Suppression réelle de la base de données
        
        return Response(
            {'message': f'Le patient {patient_info} a été supprimé définitivement.'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['get'])
    def details_complets(self, request, pk=None):
        """Endpoint spécifique pour les détails complets"""
        patient = self.get_object()
        serializer = PatientSerializer(patient)
        return Response(serializer.data)