from django.db import models
from django.utils import timezone
from patient.models import Patient
from hospitalisation.models import Hospitalisation


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def deleted_only(self):
        return super().get_queryset().filter(is_deleted=True)


class Facture(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    hospitalisation = models.ForeignKey(
        Hospitalisation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='factures'
    )
    date = models.DateTimeField(auto_now_add=True)
    motif = models.CharField(max_length=255)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    
    is_deleted = models.BooleanField(default=False, verbose_name="Archivé")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'archivage")
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()
    
    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ['-date']

    def __str__(self):
        return f"{self.patient.nom} - {self.montant} F CFA"
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()