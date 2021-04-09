import unittest
from ground_view.batch.Share import TimeboxResolver, Stadium


def test_ptn_kamata(self, stadium):
    # 1月
    actual = TimeboxResolver(stadium).get(1)
    expected = ['07-09', '09-11', '11-13', '13-15', '15-17']
    # expected = ['08-10', '10-12', '12-14', '14-16']  # メールで伝えてもらったものの、間違ってる可能性のある時間帯。一応残す。
    self.assertEqual(expected, actual, msg=f"test_Kamata_1m {stadium.nm}")

    # 3月
    actual = TimeboxResolver(stadium).get(3)
    expected = ['07-09', '09-11', '11-13', '13-15', '15-17']
    # expected = ['08-10', '10-12', '12-14', '14-16']
    self.assertEqual(expected, actual, msg=f"test_Kamata_3m {stadium.nm}")

    # 4月
    actual = TimeboxResolver(stadium).get(4)
    expected = ['06-08', '08-10', '10-12', '12-14', '14-16', '16-18']
    self.assertEqual(expected, actual, msg=f"test_Kamata_4m {stadium.nm}")

    # 8月
    actual = TimeboxResolver(stadium).get(8)
    expected = ['06-08', '08-10', '10-12', '12-14', '14-16', '16-18']
    self.assertEqual(expected, actual, msg=f"test_Kamata_8m {stadium.nm}")

    # 9月
    actual = TimeboxResolver(stadium).get(9)
    expected = ['07-09', '09-11', '11-13', '13-15', '15-17']
    self.assertEqual(expected, actual, msg=f"test_Kamata_9m {stadium.nm}")

    # 10月
    actual = TimeboxResolver(stadium).get(10)
    expected = ['07-09', '09-11', '11-13', '13-15', '15-17']
    self.assertEqual(expected, actual, msg=f"test_Kamata_10m {stadium.nm}")

    # 11月
    actual = TimeboxResolver(stadium).get(11)
    # expected = ['08-10', '10-12', '12-14', '14-16']
    expected = ['07-09', '09-11', '11-13', '13-15', '15-17']
    self.assertEqual(expected, actual, msg=f"test_Kamata_11m {stadium.nm}")

    # 12月
    actual = TimeboxResolver(stadium).get(12)
    # expected = ['08-10', '10-12', '12-14', '14-16']
    expected = ['07-09', '09-11', '11-13', '13-15', '15-17']
    self.assertEqual(expected, actual, msg="test_Kamata_12m")


class TestTimeboxResolver(unittest.TestCase):

    def test_Kamata(self):
        test_ptn_kamata(self, Stadium.TAMAGAWA)
        test_ptn_kamata(self, Stadium.GASUBASHI)
        test_ptn_kamata(self, Stadium.ROKUGOBASHI)

    def test_Chofu(self):
        # 1月
        actual = TimeboxResolver(Stadium.HIGASHI_CHOFU).get(1)
        expected = ['08-10', '10-12', '12-14', '14-16']
        self.assertEqual(expected, actual, msg=f"test_Chofu_1m {Stadium.HIGASHI_CHOFU.nm}")

        # 3月
        actual = TimeboxResolver(Stadium.HIGASHI_CHOFU).get(3)
        expected = ['08-10', '10-12', '12-14', '14-16']
        self.assertEqual(expected, actual, msg=f"test_Chofu_3m {Stadium.HIGASHI_CHOFU.nm}")

        # 4月
        actual = TimeboxResolver(Stadium.HIGASHI_CHOFU).get(4)
        expected = ['09-11', '11-13', '13-15', '15-17', '17-19', '19-21']
        self.assertEqual(expected, actual, msg=f"test_Chofu_4m {Stadium.HIGASHI_CHOFU.nm}")

        # 11月
        actual = TimeboxResolver(Stadium.HIGASHI_CHOFU).get(11)
        expected = ['09-11', '11-13', '13-15', '15-17', '17-19', '19-21']
        self.assertEqual(expected, actual, msg=f"test_Chofu_11m {Stadium.HIGASHI_CHOFU.nm}")

        # 12月
        actual = TimeboxResolver(Stadium.HIGASHI_CHOFU).get(12)
        expected = ['08-10', '10-12', '12-14', '14-16']
        self.assertEqual(expected, actual, msg=f"test_Chofu_12m {Stadium.HIGASHI_CHOFU.nm}")

    def test_Haginaka(self):
        # 1月
        actual = TimeboxResolver(Stadium.HAGINAKA).get(1)
        # expected = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20']
        expected = ['08-10', '10-12', '12-14', '14-16']
        self.assertEqual(expected, actual, msg=f"test_Haginaka_1m {Stadium.HAGINAKA.nm}")

        # 3月
        actual = TimeboxResolver(Stadium.HAGINAKA).get(3)
        # expected = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20']
        expected = ['08-10', '10-12', '12-14', '14-16']
        self.assertEqual(expected, actual, msg=f"test_Haginaka_3m {Stadium.HAGINAKA.nm}")

        # 4月
        actual = TimeboxResolver(Stadium.HAGINAKA).get(4)
        expected = ['07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21']
        self.assertEqual(expected, actual, msg=f"test_Haginaka_4m {Stadium.HAGINAKA.nm}")

        # 11月
        actual = TimeboxResolver(Stadium.HAGINAKA).get(11)
        # expected = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20']
        expected = ['07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21']
        self.assertEqual(expected, actual, msg=f"test_Haginaka_11m {Stadium.HAGINAKA.nm}")

        # 12月
        actual = TimeboxResolver(Stadium.HAGINAKA).get(12)
        # expected = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20']
        expected = ['08-10', '10-12', '12-14', '14-16']
        self.assertEqual(expected, actual, msg=f"test_Haginaka_12m {Stadium.HAGINAKA.nm}")

    def test_Oota(self):
        # 1月
        actual = TimeboxResolver(Stadium.OOTA_ST).get(1)
        # expected = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20']
        expected = ['08-10', '10-12', '12-14', '14-16']
        self.assertEqual(expected, actual, msg=f"test_Oota_1m {Stadium.Oota.nm}")


if __name__ == "__main__":
    unittest.main()