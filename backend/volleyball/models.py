from django.db import models
class League(models.Model):
 provider_key=models.CharField(max_length=100,unique=True)
 name=models.CharField(max_length=200)
 gender=models.CharField(max_length=1,choices=[('M','Men'),('W','Women')])
 country=models.CharField(max_length=2)
 official_url=models.URLField()
class Match(models.Model):
 source_key=models.CharField(max_length=120,unique=True)
 league=models.ForeignKey(League,on_delete=models.PROTECT)
 played_on=models.DateField()
 home=models.CharField(max_length=200)
 away=models.CharField(max_length=200)
 home_sets=models.PositiveSmallIntegerField()
 away_sets=models.PositiveSmallIntegerField()
 source_url=models.URLField()
class PlayerMatchStat(models.Model):
 match=models.ForeignKey(Match,on_delete=models.CASCADE)
 player_name=models.CharField(max_length=200)
 club=models.CharField(max_length=200)
 points=models.PositiveSmallIntegerField(null=True)
 attack_attempts=models.PositiveSmallIntegerField(null=True)
 attack_kills=models.PositiveSmallIntegerField(null=True)
 serve_aces=models.PositiveSmallIntegerField(null=True)
 block_points=models.PositiveSmallIntegerField(null=True)
 reception_attempts=models.PositiveSmallIntegerField(null=True)
 reception_positive=models.PositiveSmallIntegerField(null=True)
 source_url=models.URLField()
 class Meta:unique_together=[('match','player_name','club')]
