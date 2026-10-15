from rest_framework import serializers
from .models import Medecin


class MedecinSerializer(serializers.ModelSerializer):
    # ✅ Expose 'id' en plus de 'id_medecin' pour que le frontend React
    # puisse construire ses Maps avec la clé 'id' standard
    id = serializers.IntegerField(source='id_medecin', read_only=True)

    class Meta:
        model = Medecin
        fields = [
            'id',           # ← alias de id_medecin, utilisé par React
            'id_medecin',   # ← clé primaire réelle
            'nom',
            'prenom',
            'specialite',
            'email',
            'is_deleted',
            'deleted_at',
        ]
        read_only_fields = ['id', 'id_medecin', 'deleted_at']