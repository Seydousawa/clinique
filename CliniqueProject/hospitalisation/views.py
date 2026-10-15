from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Hospitalisation
from .serializer import HospitalisationSerializer


class HospitalisationViewSet(viewsets.ModelViewSet):
    queryset = Hospitalisation.objects.all()
    serializer_class = HospitalisationSerializer
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', 'active')
        
        if status_filter == 'archived':
            return Hospitalisation.objects.deleted_only()
        elif status_filter == 'all':
            return Hospitalisation.all_objects.all()
        else:
            return Hospitalisation.objects.all()
    
    def get_object(self):
        if self.action in ['restore', 'permanent_delete']:
            queryset = Hospitalisation.all_objects.all()
        else:
            queryset = self.filter_queryset(self.get_queryset())
        
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj
    
    def destroy(self, request, *args, **kwargs):
        hospitalisation = self.get_object()
        patient_name = f"{hospitalisation.patient.prenom} {hospitalisation.patient.nom}" if hospitalisation.patient else "Patient inconnu"
        chambre = hospitalisation.chambre
        hospitalisation.soft_delete()
        return Response(
            {
                'message': f'L\'hospitalisation du patient {patient_name} (Ch. {chambre}) a été archivée avec succès.',
                'id': hospitalisation.id
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        hospitalisation = self.get_object()
        if not hospitalisation.is_deleted:
            return Response(
                {'error': 'Cette hospitalisation n\'est pas archivée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        patient_name = f"{hospitalisation.patient.prenom} {hospitalisation.patient.nom}" if hospitalisation.patient else "Patient inconnu"
        chambre = hospitalisation.chambre
        hospitalisation.restore()
        return Response(
            {
                'message': f'L\'hospitalisation du patient {patient_name} (Ch. {chambre}) a été restaurée avec succès.',
                'hospitalisation': HospitalisationSerializer(hospitalisation).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def archived(self, request):
        archived_hospitalisations = Hospitalisation.objects.deleted_only()
        serializer = self.get_serializer(archived_hospitalisations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        hospitalisation = self.get_object()
        patient_name = f"{hospitalisation.patient.prenom} {hospitalisation.patient.nom}" if hospitalisation.patient else "Patient inconnu"
        chambre = hospitalisation.chambre
        hospitalisation.delete()
        return Response(
            {'message': f'L\'hospitalisation du patient {patient_name} (Ch. {chambre}) a été supprimée définitivement.'},
            status=status.HTTP_204_NO_CONTENT
        )