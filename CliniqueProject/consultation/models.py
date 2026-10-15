from django.db import models
from django.utils import timezone
from patient.models import Patient
from medecin.models import Medecin


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


class Consultation(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    medecin = models.ForeignKey(Medecin, on_delete=models.SET_NULL, null=True, blank=True, related_name='consultations')
    date_consultation = models.DateField()
    symptome = models.TextField()
    diagnostic = models.TextField(blank=True)  # Ajout de blank=True pour permettre un diagnostic vide initialement
    observation = models.CharField(max_length=100, blank=True, default='')
    traitement = models.TextField(blank=True, default='')  # Changé null=True en default='' pour cohérence
    
    # Champs pour le soft delete
    is_deleted = models.BooleanField(default=False, verbose_name="Archivé")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'archivage")
    
    # Champs de traçabilité
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")
    
    # Managers
    objects = SoftDeleteManager()  # Manager par défaut (sans les supprimés)
    all_objects = models.Manager()  # Manager pour accéder à tous les objets
    
    class Meta:
        verbose_name = "Consultation"
        verbose_name_plural = "Consultations"
        ordering = ['-date_consultation', '-created_at']
        indexes = [
            models.Index(fields=['-date_consultation']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        medecin_info = f"Dr. {self.medecin.nom}" if self.medecin else "Sans médecin"
        return f"{self.patient.nom} - {medecin_info} - {self.date_consultation.strftime('%d/%m/%Y')}"
    
    def soft_delete(self):
        """Suppression douce (archivage)"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])
    
    def restore(self):
        """Restauration d'un objet archivé"""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])