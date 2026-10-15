from django.db import models
from consultation.models import Consultation
from produit.models import Produit 
from patient.models import Patient

class Examen(models.Model):
    """Modèle pour les examens médicaux - GARDÉ pour référence mais plus utilisé dans Prescription"""
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return self.nom
    
    class Meta:
        verbose_name = "Examen"
        verbose_name_plural = "Examens"

class Prescription(models.Model):
    TYPE_CHOICES = [
        ('ordonnance', 'Ordonnance (Médicament)'),
        ('examen', 'Examen Médical'),
    ]
    
    # MODIFIÉ : Deux champs pour consultation - un pour la relation, un pour le texte libre
    consultation = models.ForeignKey(
        Consultation, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        help_text="Consultation existante (optionnel)"
    )
    consultation_nom = models.CharField(
        max_length=200,
        blank=True,
        help_text="Description libre de la consultation"
    )
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    type_prescription = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES,
        default='ordonnance'
    )
    
    # Pour les ordonnances
    produit = models.ForeignKey(
        Produit, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Remplir si type = ordonnance"
    )
    quantite = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Quantité pour les médicaments"
    )
    posologie = models.TextField(
        blank=True,
        help_text="Instructions de prise du médicament"
    )
    
    # Pour les examens
    examen_nom = models.CharField(
        max_length=200,
        blank=True,
        help_text="Nom de l'examen prescrit (saisie libre)"
    )
    
    instructions = models.TextField(
        blank=True,
        help_text="Instructions pour l'examen"
    )
    
    date_prescription = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        if self.type_prescription == 'ordonnance':
            return f"Ordonnance: {self.produit} x {self.quantite} pour {self.patient}"
        else:
            return f"Examen: {self.examen_nom} pour {self.patient}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.type_prescription == 'ordonnance':
            if not self.produit:
                raise ValidationError("Le produit est requis pour une ordonnance")
            if not self.quantite:
                raise ValidationError("La quantité est requise pour une ordonnance")
        elif self.type_prescription == 'examen':
            if not self.examen_nom:
                raise ValidationError("Le nom de l'examen est requis pour une prescription d'examen")
        
        # Validation: soit consultation, soit consultation_nom doit être rempli
        if not self.consultation and not self.consultation_nom:
            raise ValidationError("Vous devez spécifier soit une consultation existante, soit une description de consultation")
    
    class Meta:
        verbose_name = "Prescription"
        verbose_name_plural = "Prescriptions"
        ordering = ['-date_prescription']