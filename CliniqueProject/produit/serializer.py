from rest_framework import serializers
from .models import Produit

class ProduitSerializer(serializers.ModelSerializer):
    fournisseur_nom = serializers.SerializerMethodField()
    stock_insuffisant = serializers.SerializerMethodField()
    montant_total = serializers.SerializerMethodField()
    valeur_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Produit
        fields = [
            'id_produit',
            'designation',
            'prix',
            'quantite',
            'quantite_stock',
            'stock_minimum',
            'date_expiration',
            'actif',
            'montant_total',
            'valeur_stock',
            'fournisseur_nom',
            'stock_insuffisant'
        ]
    
    def get_fournisseur_nom(self, obj):
        """Retourne un fournisseur par défaut ou depuis une relation"""
        try:
            return obj.fournisseur.nom
        except:
            return "Fournisseur Principal"
    
    def get_stock_insuffisant(self, obj):
        """Vérifie si le stock est insuffisant"""
        return obj.quantite_stock <= obj.stock_minimum
    
    def get_montant_total(self, obj):
        """Calcule le montant total : prix x quantité_stock"""
        return obj.prix * obj.quantite_stock
    
    def get_valeur_stock(self, obj):
        """Valeur totale du stock en FCFA"""
        return obj.prix * obj.quantite_stock