from rest_framework import serializers
from .models import Consultation
from patient.models import Patient
from medecin.models import Medecin


class ConsultationSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour création/modification/détail.
    """
    medecin_nom = serializers.CharField(source='medecin.nom', read_only=True, allow_null=True, default=None)
    medecin_prenom = serializers.CharField(source='medecin.prenom', read_only=True, allow_null=True, default=None)
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    medecin_nom_complet = serializers.SerializerMethodField()
    patient_nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = [
            'id',
            'patient',            
            'patient_nom',
            'patient_prenom',
            'patient_nom_complet',
            'medecin',           
            'medecin_nom',
            'medecin_prenom',
            'medecin_nom_complet',
            'date_consultation',
            'symptome',
            'diagnostic',
            'observation',
            'traitement',
            'is_deleted',
            'deleted_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'deleted_at', 'created_at', 'updated_at']

    def get_medecin_nom_complet(self, obj):
        if obj.medecin:
            return f"Dr. {obj.medecin.prenom} {obj.medecin.nom}".strip()
        return None

    def get_patient_nom_complet(self, obj):
        return f"{obj.patient.prenom} {obj.patient.nom}".strip()

    def validate_patient(self, value):
        if not value:
            raise serializers.ValidationError("Le patient est obligatoire.")
        return value

    def validate_medecin(self, value):
        if value is None:
            return value
        return value

    def validate_date_consultation(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError(
                "La date de consultation ne peut pas être dans le futur."
            )
        return value

    def validate(self, data):
        patient = data.get('patient')
        if patient and hasattr(patient, 'is_deleted') and patient.is_deleted:
            raise serializers.ValidationError({
                'patient': 'Impossible de créer une consultation pour un patient archivé.'
            })
        medecin = data.get('medecin')
        if medecin and hasattr(medecin, 'is_deleted') and medecin.is_deleted:
            raise serializers.ValidationError({
                'medecin': 'Impossible d\'assigner un médecin archivé à cette consultation.'
            })
        return data


class ConsultationListSerializer(serializers.ModelSerializer):
    """
    Serializer allégé pour les listes.
    IMPORTANT : inclut 'patient' et 'medecin' (IDs) pour que le frontend
    puisse résoudre les noms via patientsMap et medecinsMap.
    """
    medecin_nom_complet = serializers.SerializerMethodField()
    patient_nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = [
            'id',
            'patient',              # ← ID numérique du patient ✅
            'patient_nom_complet',
            'medecin',              # ← ID numérique du médecin ✅
            'medecin_nom_complet',
            'date_consultation',
            'symptome',
            'diagnostic',           # ← ajouté pour l'affichage dans la table
            'observation',
            'traitement',
            'is_deleted',
            'created_at',
        ]

    def get_medecin_nom_complet(self, obj):
        if obj.medecin:
            return f"Dr. {obj.medecin.prenom} {obj.medecin.nom}".strip()
        return "None"

    def get_patient_nom_complet(self, obj):
        return f"{obj.patient.prenom} {obj.patient.nom}".strip()