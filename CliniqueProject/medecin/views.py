from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Medecin
from .serializer import MedecinSerializer


class MedecinViewSet(viewsets.ModelViewSet):
    serializer_class = MedecinSerializer

    def get_queryset(self):
        status_filter = self.request.query_params.get('status', 'active')
        if status_filter == 'archived':
            return Medecin.all_objects.filter(is_deleted=True).order_by('nom')
        elif status_filter == 'all':
            return Medecin.all_objects.all().order_by('nom')
        else:
            # ✅ all_objects.filter() au lieu de objects.all() — plus fiable
            return Medecin.all_objects.filter(is_deleted=False).order_by('nom')

    def get_object(self):
        if self.action in ['restore', 'permanent_delete']:
            queryset = Medecin.all_objects.all()
        else:
            queryset = self.filter_queryset(self.get_queryset())

        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def list(self, request, *args, **kwargs):
        """
        ✅ Retourne un tableau direct [] sans pagination
        pour que le frontend puisse faire Array.isArray(data) = true
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        medecin = self.get_object()
        medecin.soft_delete()
        return Response(
            {'message': f'Le médecin {medecin.prenom} {medecin.nom} a été archivé avec succès.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        medecin = self.get_object()
        if not medecin.is_deleted:
            return Response(
                {'error': 'Ce médecin n\'est pas archivé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        medecin.restore()
        return Response(
            {'message': f'Le médecin {medecin.prenom} {medecin.nom} a été restauré avec succès.',
             'medecin': MedecinSerializer(medecin).data},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def archived(self, request):
        archived_medecins = Medecin.all_objects.filter(is_deleted=True).order_by('nom')
        serializer = self.get_serializer(archived_medecins, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        medecin = self.get_object()
        medecin_info = f"{medecin.prenom} {medecin.nom}"
        medecin.delete()
        return Response(
            {'message': f'Le médecin {medecin_info} a été supprimé définitivement.'},
            status=status.HTTP_204_NO_CONTENT
        )