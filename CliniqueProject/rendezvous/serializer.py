from rest_framework import serializers
from .models import RendezVous

class RendezVousSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source="patient.nom", read_only=True)
    medecin_nom = serializers.CharField(source="medecin.nom", read_only=True)

    class Meta:
        model = RendezVous
        fields = [
            "id", "patient", "patient_nom", 
            "medecin", "medecin_nom", 
            "date_rdv", "motif", "statut", "notes"
        ]
