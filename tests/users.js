module.exports = function(expect, request, base_url) {
    describe('GET /users', function() {
        it('should return all users in the database', function(done) {
            request.get(base_url + 'users', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expected_results = [
                    {
                        id: 1,
                        username: 'deanj'
                    },
                    {
                        id: 2,
                        username: 'tschuy'
                    }
                ];
                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);
                expect(JSON.parse(bodyAsString)).to.eql(expected_results);
                done();
            });
        });
    });
};
