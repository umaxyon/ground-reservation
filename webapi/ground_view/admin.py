from django.contrib import admin
from ground_view.models import GroundInfo, SystemCondition, ReservationPlan, ReservationTarget


class GraundInfoAdmin(admin.ModelAdmin):
    list_display = ('ym', 'dt', 'week_day', 'area', 'gname', 'timebox')


class SystemConditionAdmin(admin.ModelAdmin):
    list_display = ('available', 'debug', 'last_update')


class ReservationPlanAdmin(admin.ModelAdmin):
    list_display = ('status', 'ymd_range', 'area_csv')


class ReservationTargetAdmin(admin.ModelAdmin):
    list_display = ('ym', 'dt', 'week_day', 'area', 'gname', 'timebox')


admin.site.register(GroundInfo, GraundInfoAdmin)
admin.site.register(SystemCondition, SystemConditionAdmin)
admin.site.register(ReservationPlan, ReservationPlanAdmin)
admin.site.register(ReservationTarget, ReservationTargetAdmin)
