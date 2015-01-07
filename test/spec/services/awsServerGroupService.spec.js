/*
 * Copyright 2014 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

describe('Service: awsServerGroup', function () {

  beforeEach(loadDeckWithoutCacheInitializer);

  beforeEach(inject(function (_awsServerGroupService_, _accountService_, _$q_, _settings_, $rootScope) {
    this.service = _awsServerGroupService_;
    this.accountService = _accountService_;
    this.$q = _$q_;
    this.settings = _settings_;
    this.$scope = $rootScope;
  }));

  describe('buildServerGroupCommandFromPipeline', function () {

    beforeEach(function() {

      this.cluster = {
        loadBalancers: ['elb-1'],
        credentials: 'prod',
        availabilityZones: {
          'us-west-1': ['d','g']
        },
        capacity: {
          min: 1,
          max: 1
        }
      };

      this.settings.defaults.account = 'test';
      this.settings.defaults.region = 'us-east-1';

      spyOn(this.accountService, 'getPreferredZonesByAccount').and.returnValue(
        this.$q.when({
          test: {
            'us-west-1': ['a', 'b'],
            'us-east-1': ['d', 'e'],
          },
          prod: {
            'us-east-1': ['d','e'],
            'eu-west-1': ['a','m']
          }
        })
      );
      spyOn(this.accountService, 'getRegionsKeyedByAccount').and.returnValue(
        this.$q.when({
          test: ['us-east-1','us-west-1'],
          prod: ['us-west-1', 'eu-west-1']
        })
      );

    });

    it('applies account, region from cluster', function () {

      var command = null;
      this.service.buildServerGroupCommandFromPipeline({}, this.cluster, 'prod').then(function(result) {
        command = result;
      });

      this.$scope.$digest();

      expect(command.credentials).toBe('prod');
      expect(command.region).toBe('us-west-1');
    });

  });

});
