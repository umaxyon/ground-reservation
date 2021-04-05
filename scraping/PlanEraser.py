import logging
from Dao import Dao
from ground_view.batch.Share import DateTimeUtil as Du


class PlanEraser:
    def __init__(self, log, dao):
        self.log = log
        self.dao = dao

    def run(self):
        self.log.debug('plan eraser start.')

        del_targets = self.dao.find_old_plan(int(Du.add_day_str(Du.str_today(), 3)))
        self.log.debug(f'del_targes=${del_targets}')
        for pid in del_targets:
            self.dao.delete_targets_and_plan(pid)

        self.log.debug('plan eraser end.')


if __name__ == '__main__':
    PlanEraser(logging.getLogger('test'), Dao()).run()
