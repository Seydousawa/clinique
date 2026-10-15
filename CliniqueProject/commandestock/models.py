from django.db import models
from produit.models import Produit

class CommandeStock(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('commande', 'Commandée'),
        ('recu', 'Reçue'),
    ]
    
    id = models.IntegerField(primary_key=True)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField()
    date_commande = models.DateField(auto_now_add=True)
    date_reception = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    fournisseur = models.CharField(max_length=100, blank=True, default='Non spécifié')

    class Meta:
        ordering = ['-date_commande']

    def __str__(self):
        return f"Commande {self.produit} x {self.quantite} - {self.statut}"