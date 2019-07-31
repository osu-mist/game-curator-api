from datetime import datetime
import json
import logging
import unittest
import yaml

from prance import ResolvingParser

import utils


class integration_tests(unittest.TestCase):
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
            cls.test_cases = config['test_cases']
            cls.local_test = config['local_test']

        with open(openapi_path) as openapi_file:
            openapi = yaml.load(openapi_file, Loader=yaml.SafeLoader)
            if 'swagger' in openapi:
                backend = 'flex'
            elif 'openapi' in openapi:
                backend = 'openapi-spec-validator'
            else:
                exit('Error: could not determine openapi document version')

        parser = ResolvingParser(openapi_path, backend=backend)
        cls.openapi = parser.specification

    @classmethod
    def cleanup(cls):
        cls.session.close()

    # Assert that response_data contains data
    def assert_data_returned(self, test_case, response_data):
        error_message = (f'No data returned from server.'
                         f' Check that \'{test_case}\' in configuration.json'
                         f' contains valid data.')
        self.assertGreater(len(response_data), 0, error_message)

    # Test case: GET /developers/{developerId}
    def test_get_developer_by_id(self):
        resource = 'DeveloperResource'
        current_test_case = 'valid_developer_ids'
        for developer_id in self.test_cases[current_test_case]:
            with self.subTest('Test valid developer Ids',
                              developer_id=developer_id):
                response = utils.test_endpoint(self,
                                               f'/developers/{developer_id}',
                                               resource,
                                               200)
                response_data = response.json()['data']
                actual_developer_id = response_data['id']
                self.assertEqual(actual_developer_id, developer_id)

        current_test_case = 'non_existant_developer_ids'
        for developer_id in self.test_cases[current_test_case]:
            with self.subTest('Test invalid developer Ids',
                              developer_id=developer_id):
                utils.test_endpoint(self,
                                    f'/developers/{developer_id}',
                                    'Error',
                                    404)

    # Test case: GET /developers
    def test_get_developers(self):
        resource = 'DeveloperResource'
        current_test_case = 'developer_names'
        for developer_name in self.test_cases[current_test_case]:
            with self.subTest('Test name query parameter',
                              developer_name=developer_name):
                params = {'name': developer_name}
                response = utils.test_endpoint(self,
                                               f'/developers',
                                               resource,
                                               200,
                                               query_params=params)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_name = row['attributes']['name']
                    self.assertEqual(developer_name, returned_name)

    # Test case: GET /games/{gameId}
    def test_get_games_by_id(self):
        resource = 'GameResource'
        nullable_fields = ['score']
        current_test_case = 'valid_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test valid game ids', game_id=game_id):
                response = utils.test_endpoint(self,
                                               f'/games/{game_id}',
                                               resource,
                                               200,
                                               nullable_fields=nullable_fields)
                response_data = response.json()['data']
                returned_game_id = response_data['id']
                self.assertEqual(returned_game_id, game_id)

        current_test_case = 'non_existant_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test non existant game ids', game_id=game_id):
                response = utils.test_endpoint(self,
                                               f'/games/{game_id}',
                                               'Error',
                                               404,
                                               nullable_fields=nullable_fields)

    # Test case: GET /games
    def test_get_games(self):
        path = '/games'
        resource = 'GameResource'
        nullable_fields = ['score']
        current_test_case = 'game_names'
        for game_name in self.test_cases[current_test_case]:
            with self.subTest('Test name query parameter',
                              game_name=game_name):
                params = {'name': game_name}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params,
                                               nullable_fields=nullable_fields)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_name = row['attributes']['name']
                    self.assertEqual(game_name, returned_name)

        current_test_case = 'game_developer_ids'
        for developer_id in self.test_cases[current_test_case]:
            with self.subTest('Test developerId query parameter',
                              developer_id=developer_id):
                params = {'developerId': developer_id}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params,
                                               nullable_fields=nullable_fields)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_id = row['attributes']['developerId']
                    self.assertEqual(developer_id, returned_id)

        current_test_case = 'scores'
        for score_min in self.test_cases[current_test_case]:
            with self.subTest('Test scoreMin query parameter',
                              score_min=score_min):
                params = {'scoreMin': score_min}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params,
                                               nullable_fields=nullable_fields)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_score = row['attributes']['score']
                    self.assertLessEqual(int(score_min), returned_score)

        for score_max in self.test_cases[current_test_case]:
            with self.subTest('Test scoreMax query parameter',
                              score_max=score_max):
                params = {'scoreMax': score_max}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params,
                                               nullable_fields=nullable_fields)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_score = row['attributes']['score']
                    self.assertGreaterEqual(int(score_max), returned_score)

    # Test case: GET /reviews/{reviewId}
    def test_get_reviews_by_id(self):
        resource = 'ReviewResource'
        current_test_case = 'valid_review_ids'
        for review_id in self.test_cases[current_test_case]:
            with self.subTest('Test valid review ids', review_id=review_id):
                response = utils.test_endpoint(self,
                                               f'/reviews/{review_id}',
                                               resource,
                                               200)
                response_data = response.json()['data']
                returned_id = response_data['id']
                self.assertEqual(returned_id, review_id)

        current_test_case = 'non_existant_review_ids'
        for review_id in self.test_cases[current_test_case]:
            with self.subTest('Test non existant review ids',
                              review_id=review_id):
                response = utils.test_endpoint(self,
                                               f'/reviews/{review_id}',
                                               'Error',
                                               404)

    # Test case: GET /reviews
    def test_get_reviews(self):
        path = '/reviews'
        resource = 'ReviewResource'
        current_test_case = 'reviewer_names'
        for reviewer_name in self.test_cases[current_test_case]:
            with self.subTest('Test reviewer query parameter',
                              reviewer_name=reviewer_name):
                params = {'reviewer': reviewer_name}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_reviewer = row['attributes']['reviewer']
                    self.assertEqual(reviewer_name, returned_reviewer)

        current_test_case = 'review_game_ids'
        for game_ids in self.test_cases[current_test_case]:
            with self.subTest('Test gameIds query parameter',
                              game_ids=game_ids):
                params = {'gameIds': game_ids}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_game_id = row['attributes']['gameId']
                    self.assertIn(returned_game_id, game_ids)

        current_test_case = 'review_invalid_game_id_formats'
        for game_ids in self.test_cases[current_test_case]:
            with self.subTest('Test invalid game id query parameter formats',
                              game_ids=game_ids):
                params = {'gameIds': game_ids}
                response = utils.test_endpoint(self,
                                               path,
                                               'Error',
                                               400,
                                               query_params=params)

        current_test_case = 'scores'
        for score in self.test_cases[current_test_case]:
            with self.subTest('Test scoreMin query parameter', score=score):
                params = {'scoreMin': score}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_score = row['attributes']['score']
                    self.assertGreaterEqual(returned_score, int(score))

        for score in self.test_cases[current_test_case]:
            with self.subTest('Test scoreMax query parameter', score=score):
                params = {'scoreMax': score}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_score = row['attributes']['score']
                    self.assertLessEqual(returned_score, int(score))

        current_test_case = 'review_review_dates'
        for review_date in self.test_cases[current_test_case]:
            with self.subTest('Test reviewDate query parameter',
                              review_date=review_date):
                params = {'reviewDate': review_date}
                response = utils.test_endpoint(self,
                                               path,
                                               resource,
                                               200,
                                               query_params=params)
                response_data = response.json()['data']
                self.assert_data_returned(current_test_case, response_data)
                for row in response_data:
                    returned_review_date = row['attributes']['reviewDate']
                    date_format = '%Y-%m-%d'
                    self.assertEqual(
                        datetime.strptime(returned_review_date, date_format),
                        datetime.strptime(review_date, date_format))

        current_test_case = 'review_invalid_date_formats'
        for review_date in self.test_cases[current_test_case]:
            with self.subTest('Test invalid reviewDate formats',
                              review_date=review_date):
                params = {'reviewDate': review_date}
                response = utils.test_endpoint(self,
                                               path,
                                               'Error',
                                               400,
                                               query_params=params)


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    # Setup logging level
    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv)
    integration_tests.cleanup()
