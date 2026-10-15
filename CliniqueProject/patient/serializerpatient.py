from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['date_creation', 'date_modification', 'is_deleted', 'deleted_at']

class PatientResumeSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'nom', 'prenom', 'age', 'telephone', 'sexe', 
            'date_naissance', 'email', 'adresse', 'profession', 
            'groupe_sanguin', 'assurance_nom', 'assurance_numero', 
            'taux_couverture', 'id_patient', 'is_deleted', 'deleted_at'
        ]