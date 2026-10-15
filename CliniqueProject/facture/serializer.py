from rest_framework import serializers
from .models import Facture
from patient.models import Patient
from hospitalisation.models import Hospitalisation
from django.utils import timezone


class FactureSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    patient_id = serializers.IntegerField(write_only=True)
    hospitalisation_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    date_formatted = serializers.SerializerMethodField()
    
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Facture
        fields = [
            'id', 'patient_id', 'patient_nom', 'patient_prenom',
            'hospitalisation_id',
            'date', 'date_formatted', 'motif', 'montant', 'notes',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['id', 'is_deleted', 'deleted_at']
    
    def get_date_formatted(self, obj):
        return obj.date.strftime('%d/%m/%Y %H:%M')
    
    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être positif")
        return value
    
    def validate_patient_id(self, value):
        if not Patient.objects.filter(id=value).exists():
            raise serializers.ValidationError("Patient non trouvé")
        return value
    
    def create(self, validated_data):
        patient_id = validated_data.pop('patient_id')
        hospitalisation_id = validated_data.pop('hospitalisation_id', None)
        
        patient = Patient.objects.get(id=patient_id)
        
        hospitalisation = None
        if hospitalisation_id:
            try:
                hospitalisation = Hospitalisation.objects.get(id=hospitalisation_id)
            except Hospitalisation.DoesNotExist:
                pass
        
        facture = Facture.objects.create(
            patient=patient,
            hospitalisation=hospitalisation,
            **validated_data
        )
        
        # ✅ Clôturer automatiquement l'hospitalisation
        if hospitalisation and not hospitalisation.date_sortie:
            hospitalisation.date_sortie = timezone.now()
            hospitalisation.save()
        
        return facture
    
    def update(self, instance, validated_data):
        if 'patient_id' in validated_data:
            patient_id = validated_data.pop('patient_id')
            instance.patient = Patient.objects.get(id=patient_id)
        
        validated_data.pop('hospitalisation_id', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance