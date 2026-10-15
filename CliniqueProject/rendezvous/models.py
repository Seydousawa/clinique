from django.db import models
from  patient.models import Patient
from medecin.models import Medecin


class RendezVous(models.Model):
    STATUT_CHOICES = [
        ('programme', 'Programmé'),
        ('confirme', 'Confirmé'),
        ('en_cours', 'En cours'),
        
        ('annule', 'Annulé'),
        
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE)
    date_rdv = models.DateTimeField()
   
    motif = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='programme')
    notes = models.TextField(blank=True, null=True)
    
   
    class Meta:
        ordering = ['date_rdv']
        unique_together = ['medecin', 'date_rdv']
    
    def __str__(self):
        return f"{self.patient} - Dr. {self.medecin.nom} - {self.date_rdv}"


