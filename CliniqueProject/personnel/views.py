from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Personnel
from .serializerpersonnel import PersonnelSerializer


class PersonnelViewSet(viewsets.ModelViewSet):
    serializer_class = PersonnelSerializer
    
    def get_queryset(self):
        """
        Retourne la liste des personnels selon le paramètre 'status'
        - ?status=active (par défaut) : personnels actifs
        - ?status=archived : personnels archivés
        - ?status=all : tous les personnels
        """
        status_filter = self.request.query_params.get('status', 'active')
        
        if status_filter == 'archived':
            return Personnel.objects.deleted_only().select_related('user')
        elif status_filter == 'all':
            return Personnel.all_objects.all().select_related('user')
        else:  # 'active' par défaut
            return Personnel.objects.all().select_related('user')
    
    def get_object(self):
        """
        Surcharge pour permettre la récupération d'objets archivés
        lors des actions restore et permanent_delete
        """
        if self.action in ['restore', 'permanent_delete']:
            # Pour ces actions, on utilise le manager qui inclut tous les objets
            queryset = Personnel.all_objects.all()
        else:
            queryset = self.filter_queryset(self.get_queryset())
        
        # Récupération de l'objet
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)
        
        # Vérification des permissions (si vous en avez)
        self.check_object_permissions(self.request, obj)
        
        return obj
    
    def retrieve(self, request, *args, **kwargs):
        """GET /api/personnels/{id}/ - Récupère un personnel spécifique"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """PUT /api/personnels/{id}/ - Met à jour un personnel"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def perform_update(self, serializer):
        serializer.save()
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete (archivage) au lieu de la suppression définitive
        """
        personnel = self.get_object()
        personnel.soft_delete()
        
        return Response(
            {
                'message': f'Le personnel {personnel.user.prenom} {personnel.user.nom} a été archivé avec succès.',
                'id': personnel.user.id
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Endpoint personnalisé pour restaurer un personnel archivé
        URL: /api/personnels/{id}/restore/
        """
        personnel = self.get_object()
        
        if not personnel.is_deleted:
            return Response(
                {'error': 'Ce personnel n\'est pas archivé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        personnel.restore()
        
        return Response(
            {
                'message': f'Le personnel {personnel.user.prenom} {personnel.user.nom} a été restauré avec succès.',
                'personnel': PersonnelSerializer(personnel).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def archived(self, request):
        """
        Endpoint pour obtenir uniquement les personnels archivés
        URL: /api/personnels/archived/
        """
        archived_personnel = Personnel.objects.deleted_only().select_related('user')
        serializer = self.get_serializer(archived_personnel, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """
        Suppression définitive (ATTENTION: irréversible)
        URL: /api/personnels/{id}/permanent_delete/
        """
        personnel = self.get_object()
        personnel_info = f"{personnel.user.prenom} {personnel.user.nom}"
        # Suppression réelle de la base de données (cela supprimera aussi l'utilisateur via CASCADE)
        personnel.delete()
        
        return Response(
            {'message': f'Le personnel {personnel_info} a été supprimé définitivement.'},
            status=status.HTTP_204_NO_CONTENT
        )  
    