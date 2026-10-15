from django.db import models

class Produit(models.Model):
    id_produit = models.IntegerField(primary_key=True)
    designation = models.CharField(max_length=100)
    prix = models.IntegerField()
    quantite = models.IntegerField()
    actif = models.BooleanField(default=True)
    quantite_stock = models.IntegerField()
    stock_minimum = models.IntegerField()
    date_expiration = models.DateField()

    class Meta:
        ordering = ['designation']
        verbose_name = "Produit"
        verbose_name_plural = "Produits"

    def __str__(self):
        return f"{self.designation} - {self.prix} FCFA - {self.quantite} unités"
    
    @property
    def montant_total(self):
        """Calcule le montant total : prix x quantité_stock"""
        return self.prix * self.quantite_stock
    
    @property
    def valeur_stock(self):
        """Valeur totale du stock en FCFA"""
        return self.montant_total