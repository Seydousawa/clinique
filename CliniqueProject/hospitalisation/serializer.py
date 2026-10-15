from rest_framework import serializers
from .models import Hospitalisation
from patient.models import Patient
from medecin.models import Medecin


class HospitalisationSerializer(serializers.ModelSerializer):
    
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), 
        source='patient', 
        write_only=True
    )
    
    medecin_responsable = serializers.PrimaryKeyRelatedField(
        queryset=Medecin.objects.all(),
        required=False,
        allow_null=True
    )

    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    medecin_nom = serializers.CharField(source='medecin_responsable.nom', read_only=True, allow_null=True)
    medecin_prenom = serializers.CharField(source='medecin_responsable.prenom', read_only=True, allow_null=True)
    
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Hospitalisation
        fields = [
            'id',
            'patient',
            'patient_id',
            'medecin_responsable',
            'patient_nom',
            'patient_prenom',
            'medecin_nom',
            'medecin_prenom',
            'date_admission',
            'date_sortie',
            'motif',
            'chambre',
            'is_deleted',
            'deleted_at'
        ]

    def to_internal_value(self, data):
        if 'medecin_responsable' not in data:
            data = data.copy()
            data['medecin_responsable'] = None
        return super().to_internal_value(data)