from django.http import JsonResponse
from .models import League,Match
def health(request):return JsonResponse({'status':'ok','service':'volleyatlas-api'})
def leagues(request):return JsonResponse({'results':list(League.objects.values('id','provider_key','name','gender','country'))})
def matches(request):return JsonResponse({'results':[{'id':m.source_key,'home':m.home,'away':m.away,'score':[m.home_sets,m.away_sets],'source':m.source_url} for m in Match.objects.select_related('league').order_by('-played_on')[:100]]})
