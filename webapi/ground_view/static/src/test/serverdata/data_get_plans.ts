export default (param: any) => {
    return {
        'plans':     {
            '監視中': [
                {'id': 1, 'ymd_range': '20210313-20210313', 'author': 'user',
                    'status': '監視中', 'area_csv': '蒲田', 'target_cnt': 5, 'reserved_cnt': 3},
                {'id': 2, 'ymd_range': '20210318-20210319', 'author': 'auto',
                    'status': '監視中', 'area_csv': '蒲田,大森', 'target_cnt': 10, 'reserved_cnt': 0},
                {'id': 3, 'ymd_range': '20210320-20210321', 'author': 'auto',
                    'status': '監視中', 'area_csv': '蒲田,大森', 'target_cnt': 8, 'reserved_cnt': 0} 
            ]
        },
        'count': 3
    }
}