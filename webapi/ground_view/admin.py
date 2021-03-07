from django.contrib import admin
from ground_view.models import GroundInfo, SystemCondition


class GraundInfoAdmin(admin.ModelAdmin):
    list_display = ('ym', 'dt', 'week_day', 'area', 'gname', 'timebox')


class SystemConditionAdmin(admin.ModelAdmin):
    list_display = ('available', 'debug', 'last_update')


admin.site.register(GroundInfo, GraundInfoAdmin)
admin.site.register(SystemCondition, SystemConditionAdmin)
