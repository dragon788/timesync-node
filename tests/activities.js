module.exports = function(expect, request, baseUrl) {
    describe('GET /activities', function() {
        it('should return all activities in the database', function(done) {
            request.get(baseUrl + 'activities', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResults = [
                    {
                        name: 'Documentation',
                        slug: 'docs',
                        id: 1
                    },
                    {
                        name: 'Development',
                        slug: 'dev',
                        id: 2
                    },
                    {
                        name: 'Systems',
                        slug: 'sys',
                        id: 3
                    }
                ];

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);
                expect(jsonBody).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /activities/:slug', function() {
        it('should return activities by slug', function(done) {
            request.get(baseUrl + 'activities/sys', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    name: 'Systems',
                    slug: 'sys',
                    id: 3
                };

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);

                expect(jsonBody).to.eql(expectedResult);
                done();
            });
        });

        it('should fail with invalid slug error', function(done) {
            request.get(baseUrl + 'activities/404', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent activity'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });

        it('should fail with Invalid Slug error', function(done) {
            request.get(baseUrl + 'activities/test-!*@', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    status: 400,
                    error: 'The provided identifier was invalid',
                    text: 'Expected slug but received test-!*@'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });
};
