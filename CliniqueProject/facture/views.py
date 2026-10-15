from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404
from datetime import datetime
from .models import Facture
from .serializer import FactureSerializer


class FactureViewSet(viewsets.ModelViewSet):
    queryset = Facture.objects.all()
    serializer_class = FactureSerializer
    
    def get_queryset(self):
        """
        Retourne la liste des factures selon le paramètre 'status'
        - ?status=active (par défaut) : factures actives
        - ?status=archived : factures archivées
        - ?status=all : toutes les factures
        """
        status_filter = self.request.query_params.get('status', 'active')
        
        if status_filter == 'archived':
            queryset = Facture.objects.deleted_only()
        elif status_filter == 'all':
            queryset = Facture.all_objects.all()
        else:  # 'active' par défaut
            queryset = Facture.objects.all()
        
        queryset = queryset.order_by('-date')
        
        # Filtres existants
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
       
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        if date_debut:
            try:
                debut = datetime.strptime(date_debut, '%Y-%m-%d')
                queryset = queryset.filter(date__gte=debut)
            except ValueError:
                pass
        if date_fin:
            try:
                fin = datetime.strptime(date_fin, '%Y-%m-%d')
                fin = fin.replace(hour=23, minute=59, second=59)
                queryset = queryset.filter(date__lte=fin)
            except ValueError:
                pass
       
        return queryset
    
    def get_object(self):
        """
        Surcharge pour permettre la récupération d'objets archivés
        lors des actions restore et permanent_delete
        """
        if self.action in ['restore', 'permanent_delete']:
            queryset = Facture.all_objects.all()
        else:
            queryset = self.filter_queryset(self.get_queryset())
        
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)
        
        self.check_object_permissions(self.request, obj)
        
        return obj
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete (archivage) au lieu de la suppression définitive"""
        facture = self.get_object()
        patient_name = f"{facture.patient.prenom} {facture.patient.nom}" if facture.patient else "Patient inconnu"
        montant = facture.montant
        
        facture.soft_delete()
        
        return Response(
            {
                'message': f'Le paiement de {patient_name} ({montant} F CFA) a été archivé avec succès.',
                'id': facture.id
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Endpoint personnalisé pour restaurer une facture archivée
        URL: /api/factures/{id}/restore/
        """
        facture = self.get_object()
        
        if not facture.is_deleted:
            return Response(
                {'error': 'Ce paiement n\'est pas archivé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        patient_name = f"{facture.patient.prenom} {facture.patient.nom}" if facture.patient else "Patient inconnu"
        montant = facture.montant
        
        facture.restore()
        
        return Response(
            {
                'message': f'Le paiement de {patient_name} ({montant} F CFA) a été restauré avec succès.',
                'facture': FactureSerializer(facture).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def archived(self, request):
        """
        Endpoint pour obtenir uniquement les factures archivées
        URL: /api/factures/archived/
        """
        archived_factures = Facture.objects.deleted_only()
        serializer = self.get_serializer(archived_factures, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """
        Suppression définitive (ATTENTION: irréversible)
        URL: /api/factures/{id}/permanent_delete/
        """
        facture = self.get_object()
        patient_name = f"{facture.patient.prenom} {facture.patient.nom}" if facture.patient else "Patient inconnu"
        montant = facture.montant
        
        facture.delete()  # Suppression réelle de la base de données
        
        return Response(
            {'message': f'Le paiement de {patient_name} ({montant} F CFA) a été supprimé définitivement.'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Statistiques des factures
        URL: /api/factures/statistics/
        """
        status_filter = request.query_params.get('status', 'active')
        
        if status_filter == 'archived':
            queryset = Facture.objects.deleted_only()
        elif status_filter == 'all':
            queryset = Facture.all_objects.all()
        else:
            queryset = Facture.objects.all()
        
        total = queryset.aggregate(total=Sum('montant'))['total'] or 0
        count = queryset.count()
        
        return Response({
            'total_montant': float(total),
            'nombre_factures': count,
            'montant_moyen': float(total / count) if count > 0 else 0
        })