from rest_framework import serializers
from .models import CommandeStock

class CommandeStockSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.designation', read_only=True)
    produit_prix = serializers.IntegerField(source='produit.prix', read_only=True)
    quantite_stock = serializers.IntegerField(source='produit.quantite_stock', read_only=True)
    montant_total = serializers.SerializerMethodField()
    
    class Meta:
        model = CommandeStock
        fields = [
            'id', 
            'produit', 
            'produit_nom', 
            'produit_prix',
            'quantite_stock',
            'quantite', 
            'date_commande',
            'date_reception',
            'statut',
            'fournisseur',
            'montant_total'
        ]
    
    def get_montant_total(self, obj):
        """Calcule le montant total de la commande"""
        if obj.produit and obj.produit.prix:
            return obj.produit.prix * obj.quantite
        return 0