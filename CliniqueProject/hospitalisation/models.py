from django.db import models
from django.utils import timezone
from patient.models import Patient
from medecin.models import Medecin


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def deleted_only(self):
        return super().get_queryset().filter(is_deleted=True)


class Hospitalisation(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medecin_responsable = models.ForeignKey(
        Medecin, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    date_admission = models.DateTimeField()
    date_sortie = models.DateTimeField(null=True, blank=True)
    motif = models.TextField()
    chambre = models.CharField(max_length=50)
    
    is_deleted = models.BooleanField(default=False, verbose_name="Archivé")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'archivage")
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()
    
    class Meta:
        verbose_name = "Hospitalisation"
        verbose_name_plural = "Hospitalisations"
        ordering = ['-date_admission']

    def __str__(self):
        return f"{self.patient.nom} - {self.date_admission.strftime('%Y-%m-%d')}"
    
    def duree_sejour(self):
        if self.date_sortie:
            return self.date_sortie - self.date_admission
        return None
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()