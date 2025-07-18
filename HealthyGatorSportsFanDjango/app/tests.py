import time
from unittest.mock import patch, MagicMock
from django.test import TestCase
from app.utils import send_notification, check_game_status
import cfbd

class UtilsTestCase(TestCase):
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_winning_decisive(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=21),
    #                   away_team=MagicMock(name='Opponent', points=7), status='in_progress')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status, 'Florida Gators', 21, 'Opponent', 7)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('winning_decisive')
    #     self.assertEqual(game_status, 'winning_decisive')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_tied(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=14),
    #                   away_team=MagicMock(name='Opponent', points=14), status='in_progress')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('tied')
    #     self.assertEqual(game_status, 'tied')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_losing_decisive(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=10),
    #                   away_team=MagicMock(name='Opponent', points=24), status='completed')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('losing_decisive')
    #     self.assertEqual(game_status, 'losing_decisive')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_winning_close(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=21),
    #                   away_team=MagicMock(name='Opponent', points=20), status='in_progress')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('winning_close')
    #     self.assertEqual(game_status, 'winning_close')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_losing_close(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=20),
    #                   away_team=MagicMock(name='Opponent', points=21), status='in_progress')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('losing_close')
    #     self.assertEqual(game_status, 'losing_close')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_won_decisive(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=35),
    #                   away_team=MagicMock(name='Opponent', points=14), status='completed')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('won_decisive')
    #     self.assertEqual(game_status, 'won_decisive')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_won_close(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=21),
    #                   away_team=MagicMock(name='Opponent', points=20), status='completed')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('won_close')
    #     self.assertEqual(game_status, 'won_close')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_lost_close(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=20),
    #                   away_team=MagicMock(name='Opponent', points=21), status='completed')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('lost_close')
    #     self.assertEqual(game_status, 'lost_close')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_lost_decisive(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=10),
    #                   away_team=MagicMock(name='Opponent', points=35), status='completed')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('lost_decisive')
    #     self.assertEqual(game_status, 'lost_decisive')
    #
    # @patch('app.utils.send_notification')
    # @patch('app.utils.redis_client')
    # @patch.object(cfbd.GamesApi, 'get_scoreboard')
    # @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    # def test_check_game_status_game_not_started(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
    #     mock_get_scoreboard.return_value = [
    #         MagicMock(home_team=MagicMock(name='Florida Gators', points=0),
    #                   away_team=MagicMock(name='Opponent', points=0), status='scheduled')
    #     ]
    #     mock_redis_client.get.return_value = None
    #
    #     game_status = check_game_status(cfbd.GamesApi(mock_get_default))
    #     send_notification(game_status)
    #     # mock_send_notification(game_status)
    #
    #     mock_send_notification.assert_called_once_with('Game not started')
    #     self.assertEqual(game_status, 'Game not started')


    @patch('app.utils.send_notification')
    @patch('app.utils.redis_client')
    @patch.object(cfbd.GamesApi, 'get_scoreboard')
    @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    def testGame(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_check_game_status):
        # Scenario 1
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=0),
                      away_team=MagicMock(name='Opponent', points=0), status='scheduled')
        ]
        mock_redis_client.get.return_value = None
        mock_check_game_status.return_value = 'Game not started'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 0, 'Opponent', 0)
        self.assertEqual(game_status, 'Game not started')
        time.sleep(5)

        # Scenario 2
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=0),
                      away_team=MagicMock(name='Opponent', points=7), status='in_progress')
        ]
        mock_check_game_status.return_value = 'losing_decisive'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 0, 'Opponent', 7)
        self.assertEqual(game_status, 'losing_decisive')
        time.sleep(5)

        # Scenario 3
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=0),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        mock_check_game_status.return_value = 'losing_close'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 0, 'Opponent', 14)
        self.assertEqual(game_status, 'losing_close')
        time.sleep(5)

        # Scenario 4
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=3),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        mock_check_game_status.return_value = 'losing_decisive'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 3, 'Opponent', 14)
        self.assertEqual(game_status, 'losing_decisive')
        time.sleep(5)

        # Scenario 5
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=10),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        mock_check_game_status.return_value = 'losing_close'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 10, 'Opponent', 14)
        self.assertEqual(game_status, 'losing_close')
        time.sleep(5)

        # Scenario 6
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=17),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        mock_check_game_status.return_value = 'winning_close'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 17, 'Opponent', 14)
        self.assertEqual(game_status, 'winning_close')
        time.sleep(5)

        # Scenario 7
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=24),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        mock_check_game_status.return_value = 'winning_decisive'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 24, 'Opponent', 14)
        self.assertEqual(game_status, 'winning_decisive')
        time.sleep(5)

        # Scenario 8
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=27),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        mock_check_game_status.return_value = 'winning_decisive'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 27, 'Opponent', 14)
        self.assertEqual(game_status, 'winning_decisive')
        time.sleep(5)

        # Scenario 9
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=27),
                      away_team=MagicMock(name='Opponent', points=14), status='completed')
        ]
        mock_check_game_status.return_value = 'won_decisive'
        game_status = mock_check_game_status(mock_get_scoreboard)
        send_notification(game_status, 'Florida Gators', 27, 'Opponent', 14)
        self.assertEqual(game_status, 'won_decisive')
    # Run the tests
    if __name__ == '__main__':
        import unittest
        unittest.main()