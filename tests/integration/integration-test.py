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

    def get_response(
        self,
        resource,
        params={},
        status=200,
        endpoint=''
    ):
        return utils.test_endpoint(
            self,
            endpoint,
            resource,
            status,
            params,
            ['context']
        )

    # Test case: GET /developers/{developerId}
    def test_get_developer_by_id(self):
        resource = 'DeveloperResource'
        for developer_id in self.test_cases['valid_developer_ids']:
            with self.subTest('Test valid developer Ids',
                              developer_id=developer_id):
                response = utils.test_endpoint(self,
                                               f'/developers/{developer_id}',
                                               resource,
                                               200)
                response_data = response.json()['data']
                actual_developer_id = response_data['id']
                self.assertEqual(actual_developer_id, developer_id)

        for developer_id in self.test_cases['non_existant_developer_ids']:
            with self.subTest('Test invalid developer Ids',
                              developer_id=developer_id):
                utils.test_endpoint(self,
                                    f'/developers/{developer_id}',
                                    'Error',
                                    404)

        for developer_id in self.test_cases['invalid_developer_ids']:
            with self.subTest('Test invalid developer Ids',
                              developer_id=developer_id):
                utils.test_endpoint(self,
                                    f'/developers/{developer_id}',
                                    'Error',
                                    400)

    # Test case: GET /developers
    def test_get_developers(self):
        resource = 'DeveloperResource'
        for name in self.test_cases['developer_names']:
            with self.subTest('Test name query parameter', name=name):
                params = {'name': name}
                utils.test_endpoint(self,
                                    f'/developers',
                                    resource,
                                    200,
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
