import logging
import json
from ground_view.batch.Share import DateTimeUtil as Du
from ground_view.batch.Share import DayOfWeek
from ground_view.batch.Share import PlanTargetHolder, PlanStatus
from Dao import Dao


class WeeklyPlanner:
    def __init__(self, log, dao):
        self.log = log
        self.dao = dao
        self.target_weekdays = []
        self.target_tmplates = {}

    def get_week_target(self):
        weekdays_csv = self.dao.get_week_targets()
        target_weekdays = DayOfWeek.from_csv(weekdays_csv)
        targets_jsons = self.dao.get_weekly_target_json(target_weekdays)
        for week in targets_jsons.keys():
            if week in targets_jsons:
                self.target_tmplates[week] = json.loads(targets_jsons[week])
                self.target_weekdays.append(DayOfWeek(int(week)))

    def target_date_range(self):
        last_plan = self.dao.find_last_plan_created_by_system()

        start_day = Du.to_str(Du.add_day(Du.today(), 3))
        last_day = start_day if last_plan is None else max(start_day, Du.add_day_str(last_plan.ymd_range, 1))
        end_day = Du.str_after_day(start_day, 60)

        return Du.make_day_range_with_week_day(last_day, end_day, self.target_weekdays)

    def run(self):
        self.log.debug('weekly planner start.')

        self.get_week_target()
        if len(self.target_weekdays) == 0:
            self.log.debug('no in settings targets. end.')
            return

        target_days = self.target_date_range()
        for day in target_days:
            week = DayOfWeek.from_date(Du.from_str(day)).value
            holder = PlanTargetHolder(self.target_tmplates[str(week)], PlanStatus.of('true'))
            holder.create(self.dao, day)

        self.log.debug(f'create_plan. target_days={target_days}')
        self.log.debug('weekly planner end.')


if __name__ == '__main__':
    WeeklyPlanner(logging.getLogger('test'), Dao()).run()