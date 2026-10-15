from rest_framework import serializers
from .models import Prescription, Examen

class ExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Examen
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.designation', read_only=True, allow_null=True)
    consultation_date = serializers.DateField(source='consultation.date_consultation', read_only=True, allow_null=True)  # MODIFIÉ: DateField au lieu de DateTimeField
    consultation_motif = serializers.CharField(source='consultation.motif', read_only=True, allow_null=True)
    
    type_prescription_display = serializers.CharField(
        source='get_type_prescription_display', 
        read_only=True
    )
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id',
            'type_prescription',
            'type_prescription_display',
            'consultation',
            'consultation_nom',
            'consultation_date',
            'consultation_motif',
            'patient',
            'patient_nom',
            'patient_prenom',
            'produit',
            'produit_nom',
            'quantite',
            'posologie',
            'examen_nom',
            'instructions',
            'notes',
            'date_prescription'
        ]
        read_only_fields = ['date_prescription']
    
    def validate(self, data):
        """Validation personnalisée selon le type de prescription"""
        type_prescription = data.get('type_prescription')
        
        # Validation pour la consultation
        consultation = data.get('consultation')
        consultation_nom = data.get('consultation_nom', '')
        
        # Si consultation_nom est None, convertir en chaîne vide
        if consultation_nom is None:
            consultation_nom = ''
        
        if not consultation and not consultation_nom:
            raise serializers.ValidationError({
                'consultation': "Vous devez spécifier soit une consultation existante, soit une description de consultation"
            })
        
        if type_prescription == 'ordonnance':
            if not data.get('produit'):
                raise serializers.ValidationError({
                    'produit': "Le produit est requis pour une ordonnance"
                })
            if not data.get('quantite'):
                raise serializers.ValidationError({
                    'quantite': "La quantité est requise pour une ordonnance"
                })
            # Nettoyer les champs d'examen si remplis par erreur
            data['examen_nom'] = ''
            data['instructions'] = ''
            
        elif type_prescription == 'examen':
            if not data.get('examen_nom'):
                raise serializers.ValidationError({
                    'examen_nom': "Le nom de l'examen est requis pour une prescription d'examen"
                })
            # Nettoyer les champs d'ordonnance si remplis par erreur
            data['produit'] = None
            data['quantite'] = None
            data['posologie'] = ''
        
        return data
    
    def to_representation(self, instance):
        """Override pour afficher le nom de la consultation"""
        representation = super().to_representation(instance)
        
        # Si pas de consultation liée mais il y a consultation_nom, l'utiliser
        if not representation['consultation'] and instance.consultation_nom:
            representation['consultation_info'] = instance.consultation_nom
        elif representation['consultation']:
            # Format de date simple
            if representation['consultation_date']:
                representation['consultation_info'] = f"Consultation du {representation['consultation_date']}"
            else:
                representation['consultation_info'] = "Consultation"
        
        return representation