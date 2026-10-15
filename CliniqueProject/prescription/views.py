from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Prescription, Examen
from .serializers import PrescriptionSerializer, ExamenSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    filterset_fields = ['type_prescription', 'patient', 'consultation', 'examen_nom']
    search_fields = [
        'patient__nom', 
        'patient__prenom', 
        'produit__designation', 
        'examen_nom',
        'consultation_nom',
        'consultation__motif'
    ]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('patient', 'consultation', 'produit')
        return queryset

class ExamenViewSet(viewsets.ModelViewSet):
    queryset = Examen.objects.all()
    serializer_class = ExamenSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['nom', 'description']