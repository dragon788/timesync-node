function copyJsonObject(obj) {
  // This allows us to change object properties
  // without effecting other tests
  return JSON.parse(JSON.stringify(obj));
}

module.exports = function(expect, request, baseUrl) {
  /* GET one of the /projects endpoints and check its response against
  what should be returned */
  describe('GET /projects', function() {
    it('should return all projects in the database', function(done) {
      request.get(baseUrl + 'projects', function(err, res, body) {
        var jsonBody = JSON.parse(body);
        var expectedResults = [
          {
            uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
            name: 'Ganeti Web Manager',
            slugs: ['gwm', 'ganeti-webmgr'],
            owner: 'tschuy',
            id: 1
          },
          {
            uri: 'https://code.osuosl.org/projects/pgd',
            name: 'Protein Geometry Database',
            slugs: ['pgd'],
            owner: 'deanj',
            id: 2
          },
          {
            uri: 'https://github.com/osu-cass/whats-fresh-api',
            name: 'Whats Fresh',
            slugs: ['wf'],
            owner: 'tschuy',
            id: 3
          }
        ];

        [expectedResults, jsonBody].forEach(function(list) {
          list.forEach(function(result) {
            result.slugs.sort();
          });
        });

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    });
  });

  describe('GET /projects/:slug', function() {
    it('should return projects by slug', function(done) {
      request.get(baseUrl + 'projects/gwm', function(err, res, body) {
        var jsonBody = JSON.parse(body);
        var expectedResult = {
          uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
          name: 'Ganeti Web Manager',
          slugs: ['gwm', 'ganeti-webmgr'],
          owner: 'tschuy',
          id: 1
        };
        expectedResult.slugs.sort();
        jsonBody.slugs.sort();

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('should fail with invalid slug error', function(done) {
      request.get(baseUrl + 'projects/404', function(err, res, body) {
        var jsonBody = JSON.parse(body);
        var expectedResult = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent project'
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(404);

        done();
      });
    });

    it('should fail with Invalid Slug error', function(done) {
      request.get(baseUrl + 'projects/test-!*@', function(err, res, body) {
        var jsonBody = JSON.parse(body);
        var expectedResult = {
          status: 400,
          error: 'The provided identifier was invalid',
          text: 'Expected slug but received test-!*@',
          values: ['test-!*@']
        };

        expect(jsonBody).to.eql(expectedResult);
        expect(res.statusCode).to.equal(400);

        done();
      });
    });
  });

  // Tests Patching Projects
  describe('POST /projects/:slug', function() {

    var patchedProject = {
      name: 'Ganeti Web Mgr',
      owner: 'tschuy',
      slugs: ['gwm', 'gan-web'],
      uri: 'https://code.osuosl.org/projects/',
    };

    var originalProject = {
      id: 1,
      name: 'Ganeti Web Manager',
      owner: 'tschuy',
      slugs: ['gwm', 'ganeti-webmgr'],
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr'
    };

    var patchedProjectName  = {name:  patchedProject.name };
    // var patchedProjectOwner = {owner: patchedProject.owner};
    var patchedProjectUri   = {uri:   patchedProject.uri  };
    var patchedProjectSlugs = {slugs: patchedProject.slugs};

    var badProject = {
      name:  ['a name'],
      owner: ['a owner'],
      uri:   ['a website'],
      slugs: 'a slug',
      key:   'value'
    };

    var badProjectName  = {name:  badProject.name };
    var badProjectOwner = {owner: badProject.owner};
    var badProjectUri   = {uri:   badProject.uri  };
    var badProjectSlugs = {slugs: badProject.slugs};
    var badProjectKey   = {key:   'value'         };

    var postArg = {
      auth: {
        username: 'tschuy',
        password: 'password'
      },
    };

    var requestOptions = {
      url: baseUrl + 'projects/gwm',
      json: true
    };

    // Function used for validating that the object in the database
    // is in the correct state (change or unchanged based on if the POST
    // was valid)
    var checkListEndpoint = function(done, expectedResults) {
      // Make a get request
      request.get(requestOptions.url, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        body = JSON.parse(body);
        expect(body).to.deep.equal(expectedResults);
        done();
      });
    };

    it("successfully patches a project's uri, slugs, owner, and name",
    function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProject);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        // Set expected results to the new state of the project gwm
        var expectedResults = copyJsonObject(originalProject);
        expectedResults.name = patchedProject.name;
        expectedResults.uri = patchedProject.uri;
        expectedResults.slugs = patchedProject.slugs;
        expectedResults.owner = patchedProject.owner;

        // expect body of post request to be the new state of gwm
        expect(body).to.deep.equal(expectedResults);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("successfully patches a project's uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProjectUri);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        var expectedResults = copyJsonObject(originalProject);
        expectedResults.uri = patchedProject.uri;

        expect(body).to.deep.equal(expectedResults);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("successfully patches a project's slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProjectSlugs);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        var expectedResults = copyJsonObject(originalProject);
        expectedResults.slugs = patchedProject.slugs;

        expect(body).to.deep.equal(expectedResults);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("successfully patches a project's name", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProjectName);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        var expectedResults = copyJsonObject(originalProject);
        expectedResults.name = patchedProject.name;

        expect(body).to.deep.equal(expectedResults);

        checkListEndpoint(done, expectedResults);
      });
    });

    // This test should be reenabled when administrator users are added
    //     it("successfully patches a project's owner", function(done) {
    //         postArg.object = copyJsonObject(patchedProjectOwner);
    //         requestOptions.form = copyJsonObject(postArg);
    //
    //         request.post(requestOptions, function(err, res, body) {
    //             expect(err).to.be.a('null');
    //             expect(res.statusCode).to.equal(200);
    //
    //             var expectedResults = copyJsonObject(originalProject);
    //             expectedResults.owner = patchedProject.owner;
    //
    //             body = JSON.parse(body);
    //
    //             expect(body).to.equal(expectedResults);
    //
    //             checkListEndpoint(done, expectedResults);
    //         });
    //     });

    it("doesn't patch a project with bad authentication", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProject);
      requestOptions.form.auth.password = 'not correct password';

      request.post(requestOptions, function(err, res, body) {
        expect(res.statusCode).to.equal(401);

        expect(body.error).to.equal('Authentication failure');
        expect(body.text).to.equal('Incorrect password.');

        var expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with bad uri, name, slugs, and owner",
    function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProject);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);

        expect([
          'Field uri of project should be string but was sent as ' +
          'array',
          'Field name of project should be string but was sent as ' +
          'array',
          'Field owner of project should be string but was sent as ' +
          'array',
          'Field slugs of project should be array but was sent as ' +
          'string',
          'project does not have a key field'
        ]).to.include.members([body.text]);

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with only bad uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = badProjectUri;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field uri of project' +
        ' should be string but was sent as array');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with a different owner", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.auth.username = 'deanj';
      requestOptions.form.auth.password = 'pass';
      requestOptions.form.object = copyJsonObject(patchedProject);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Authorization failure');
        expect(res.statusCode).to.equal(401);
        expect(body.text).to.equal('deanj is not authorized to ' +
        'create objects for tschuy');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with only bad slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectSlugs);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slugs of' +
        ' project should be array but was sent as string');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with only bad name", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectName);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field name of' +
        ' project should be string but was sent as array');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with just bad owner", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectOwner);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field owner of' +
        ' project should be string but was sent as array');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with just invalid key", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectKey);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('project does not' +
        ' have a key field');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.id;
      requestOptions.form.object.uri = badProject.uri;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field uri of project' +
        ' should be string but was sent as array');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with invalid uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.id;
      requestOptions.form.object.uri = 'string but not uri';

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field uri of project' +
        ' should be uri but was sent as string');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with invalid slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.id;
      requestOptions.form.object.slugs = ['@#SAfsda', '232sa$%'];

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slugs of project' +
        ' should be slugs but was sent as non-slug strings');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.id;
      requestOptions.form.object.slugs = badProject.slugs;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slugs of' +
        ' project should be array but was sent as string');

        var expectedResults = copyJsonObject(originalProject);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type name", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.id;
      requestOptions.form.object.name = badProject.name;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field name of' +
        ' project should be string but was sent as array');

        var expectedResults = originalProject;

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type owner", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.id;
      requestOptions.form.object.owner = badProject.owner;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field owner of' +
        ' project should be string but was sent as array');

        var expectedResults = originalProject;

        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with invalid key", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.id;
      requestOptions.form.object.key = badProject.key;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('project does not' +
        ' have a key field');

        var expectedResults = originalProject;

        checkListEndpoint(done, expectedResults);
      });
    });

  });

  describe('POST /projects', function() {
    // the project object to attempt to add
    var project = {
      uri: 'https://github.com/osuosl/timesync-node',
      owner: 'tschuy',
      slugs: ['ts', 'timesync'],
      name: 'TimeSync Node'
    };

    // the project as added to the database
    var newProject = {
      uri: 'https://github.com/osuosl/timesync-node',
      owner: 'tschuy',
      slugs: ['ts', 'timesync'],
      name: 'TimeSync Node',
      id: 4
    };

    // the base POST JSON
    var postArg = {
      auth: {
        username: 'tschuy',
        password: 'password'
      },
      object: project
    };

    var initialProjects = [
      {
        uri: 'https://code.osuosl.org/projects/' +
        'ganeti-webmgr',
        name: 'Ganeti Web Manager',
        slugs: ['gwm', 'ganeti-webmgr'],
        owner: 'tschuy',
        id: 1
      },
      {
        uri: 'https://code.osuosl.org/projects/pgd',
        name: 'Protein Geometry Database',
        slugs: ['pgd'],
        owner: 'deanj',
        id: 2
      },
      {
        uri: 'https://github.com/osu-cass/whats-fresh-api',
        name: 'Whats Fresh',
        slugs: ['wf'],
        owner: 'tschuy',
        id: 3
      }
    ];

    var requestOptions = {
      url: baseUrl + 'projects/',
      json: true,
      method: 'POST'
    };

    it('successfully creates a new project with slugs', function(done) {
      requestOptions.form = postArg;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);
        expect(body).to.deep.equal(newProject);

        request.get(baseUrl + 'projects', function(err, res, body) {
          // the projects/ endpoint should now have one more project
          var expectedResults = initialProjects.concat([newProject]);

          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          expect(JSON.parse(body))
          .to.have.same.deep.members(expectedResults);
          done();
        });
      });
    });

    it('successfully creates a new project with no uri', function(done) {
      // remove uri from post data
      var postNoUri = copyJsonObject(postArg);
      postNoUri.object.uri = undefined;
      requestOptions.form = postNoUri;

      // remove uri from test object
      var newProjectNoUri = copyJsonObject(newProject);
      delete newProjectNoUri.uri;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        expect(body).to.deep.equal(newProjectNoUri);

        request.get(baseUrl + 'projects', function(err, res, body) {
          // the projects/ endpoint should now have one more project
          var expectedResults = initialProjects.concat([
            {
              owner: 'tschuy',
              uri: null,
              slugs: ['ts', 'timesync'],
              name: 'TimeSync Node',
              id: 4
            }
          ]);

          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          expect(body).to.deep.have.same.members(expectedResults);
          done();
        });
      });
    });

    it('fails to create a new project with bad authentication', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(newProject);
      requestOptions.form.auth.password = 'not correct password';

      request.post(requestOptions, function(err, res, body) {
        expect(res.statusCode).to.equal(401);

        expect(body.error).to.equal('Authentication failure');
        expect(body.text).to.equal('Incorrect password.');

        request.get(baseUrl + 'projects', function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          // the projects/ list shouldn't have changed
          expect(body).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an invalid uri', function(done) {
      var postInvalidUri = copyJsonObject(postArg);
      postInvalidUri.object.uri = "Ceci n'est pas un url";
      requestOptions.form = postInvalidUri;

      request.post(requestOptions, function(err, res, body) {
        var expectedError = {
          status: 400,
          error: 'The provided identifier was invalid',
          text: "Expected uri but received Ceci n'est pas un url",
          values: ["Ceci n'est pas un url"]
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          // the projects/ list shouldn't have changed
          expect(body).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an invalid slug', function(done) {
      var postInvalidSlug = copyJsonObject(postArg);
      // of these slugs, only 'dog' is valid
      postInvalidSlug.object.slugs = ['$*#*cat', 'dog', ')_!@#mouse'];
      requestOptions.form = postInvalidSlug;

      request.post(requestOptions, function(err, res, body) {
        var expectedError = {
          status: 400,
          error: 'The provided identifier was invalid',
          text: 'Expected slug but received: $*#*cat, )_!@#mouse',
          values: ['$*#*cat', ')_!@#mouse']
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          // the projects/ list shouldn't have changed
          expect(body).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an existing slug', function(done) {
      var postExistingSlug = copyJsonObject(postArg);
      postExistingSlug.object.slugs = ['gwm', 'ganeti-webmgr', 'dog'];
      requestOptions.form = postExistingSlug;

      request.post(requestOptions, function(err, res, body) {
        var expectedError = {
          status: 409,
          error: 'The slug provided already exists',
          text: 'slugs ganeti-webmgr, gwm already exist',
          values: ['ganeti-webmgr', 'gwm']
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(409);

        request.get(baseUrl + 'projects', function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          // the projects/ list shouldn't have changed
          expect(body).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with no slugs', function(done) {
      var postNoSlug = copyJsonObject(postArg);
      postNoSlug.object.slugs = undefined;
      requestOptions.form = postNoSlug;

      request.post(requestOptions, function(err, res, body) {
        var expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'The project is missing a slug'
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          // the projects/ list shouldn't have changed
          expect(body).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with no name', function(done) {
      var postNoName = copyJsonObject(postArg);
      postNoName.object.name = undefined;
      requestOptions.form = postNoName;

      request.post(requestOptions, function(err, res, body) {
        var expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'The project is missing a name'
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          // the projects/ list shouldn't have changed
          expect(body).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an owner different from auth',
    function(done) {
      var postOtherOwner = copyJsonObject(postArg);
      postOtherOwner.object.owner = 'deanj';
      requestOptions.form = postOtherOwner;

      request.post(requestOptions, function(err, res, body) {
        var expectedError = {
          status: 401,
          error: 'Authorization failure',
          text: 'tschuy is not authorized to create objects for deanj'
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(401);

        request.get(baseUrl + 'projects', function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          body = JSON.parse(body);
          // the projects/ list shouldn't have changed
          expect(body).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });
  });

  describe('DELETE /projects/:slug', function() {
    it('deletes the desired project if no times are associated with it',
    function(done) {
      request.del(baseUrl + 'projects/pgd', function(err, res) {
        expect(res.statusCode).to.equal(200);

        request.get(baseUrl + 'projects/pgd', function(err, res, body) {
          var jsonBody = JSON.parse(body);
          var expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent project'
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(404);
          done();
        });
      });
    });

    it('Fails if it recieves a project with times associated', function(done) {
      request.del(baseUrl + 'projects/wf', function(err, res, body) {
        var jsonBody = JSON.parse(body);
        var expectedResult = {
          status: 405,
          error: 'Method not allowed',
          text: 'The method specified is not allowed for ' +
          'the project identified'
        };

        expect(res.statusCode).to.equal(405);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('Fails if it receives an invalid project', function(done) {
      request.del(baseUrl + 'projects/Not.a#project', function(err, res, body) {
        var jsonBody = JSON.parse(body);
        var expectedResult = {
          status: 400,
          error: 'The provided identifier was invalid',
          text: 'Expected slug but received Not.a-project!',
          values: ['Not.a-project!']
        };

        request.get(baseUrl + 'projects', function(err, res, body) {
          jsonBody = JSON.parse(body);
          var expectedResult = [
            {
              uri: 'https://code.osuosl.org/projects/ganeti-' +
              'webmgr',
              name: 'Ganeti Web Manager',
              slugs: ['gwm', 'ganeti-webmgr'],
              owner: 'tschuy',
              id: 1
            },
            {
              uri: 'https://code.osuosl.org/projects/pgd',
              name: 'Protein Geometry Database',
              slugs: ['pgd'],
              owner: 'deanj',
              id: 2
            },
            {
              uri: 'https://github.com/osu-cass/whats-fresh-api',
              name: 'Whats Fresh',
              slugs: ['wf'],
              owner: 'tschuy',
              id: 3
            }
          ];

          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.deep.have.same.members(expectedResult);
        });

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('Fails if it receives an non-existent project', function(done) {
      request.del(baseUrl + 'projects/doesntexist', function(err, res, body) {
        var jsonBody = JSON.parse(body);
        var expectedResult = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent slug'
        };

        request.get(baseUrl + 'projects', function(err, res, body) {
          jsonBody = JSON.parse(body);
          var expectedResult = [
            {
              uri: 'https://code.osuosl.org/projects/ganeti-' +
              'webmgr',
              name: 'Ganeti Web Manager',
              slugs: ['gwm', 'ganeti-webmgr'],
              owner: 'tschuy',
              id: 1
            },
            {
              uri: 'https://code.osuosl.org/projects/pgd',
              name: 'Protein Geometry Database',
              slugs: ['pgd'],
              owner: 'deanj',
              id: 2
            },
            {
              uri: 'https://github.com/osu-cass/whats-fresh-api',
              name: 'Whats Fresh',
              slugs: ['wf'],
              owner: 'tschuy',
              id: 3
            }
          ];

          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.deep.have.same.members(expectedResult);
        });

        expect(res.statusCode).to.equal(404);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });
};
