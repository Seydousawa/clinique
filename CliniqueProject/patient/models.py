from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import date, timedelta


class SoftDeleteManager(models.Manager):
    """Manager personnalisé pour filtrer les objets non supprimés par défaut"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        """Retourne tous les objets, y compris ceux supprimés"""
        return super().get_queryset()
    
    def deleted_only(self):
        """Retourne uniquement les objets supprimés (archivés)"""
        return super().get_queryset().filter(is_deleted=True)


class Patient(models.Model):
    
    SEXE_CHOICES = [('M', 'Masculin'), ('F', 'Féminin')]
    GROUPE_SANGUIN_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    id_patient = models.CharField(max_length=20, unique=True, editable=False)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)
    telephone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    adresse = models.TextField()
    profession = models.CharField(max_length=100, blank=True, null=True)
    groupe_sanguin = models.CharField(max_length=3, choices=GROUPE_SANGUIN_CHOICES, blank=True, null=True)
    assurance_nom = models.CharField(max_length=100, blank=True, null=True)
    assurance_numero = models.CharField(max_length=50, blank=True, null=True)
    taux_couverture = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Champs pour le soft delete
    is_deleted = models.BooleanField(default=False, verbose_name="Archivé")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'archivage")
    
    # Managers
    objects = SoftDeleteManager()  # Manager par défaut (sans les supprimés)
    all_objects = models.Manager()  # Manager pour accéder à tous les objets
    
    class Meta:
        ordering = ['nom', 'prenom']
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
    
    def save(self, *args, **kwargs):
        if not self.id_patient:
            # Générer automatiquement le numéro patient
            last_patient = Patient.all_objects.order_by('-id').first()
            if last_patient and last_patient.id:
                last_id = last_patient.id + 1
            else:
                last_id = 1
            self.id_patient = f"PAT{last_id:06d}"
        super().save(*args, **kwargs)
    
    @property
    def age(self):
        today = date.today()
        return today.year - self.date_naissance.year - (
            (today.month, today.day) < (self.date_naissance.month, self.date_naissance.day)
        )
    
    def soft_delete(self):
        """Suppression douce (archivage)"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restauration d'un objet archivé"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()
    
    def __str__(self):
        return f"{self.nom} {self.prenom}"