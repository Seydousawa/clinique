
from rest_framework import viewsets 
from .models import RendezVous
from .serializer import RendezVousSerializer


class RendezVousViewSet(viewsets.ModelViewSet):
    queryset = RendezVous.objects.all()
    serializer_class= RendezVousSerializer