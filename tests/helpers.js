var helpers = require('../src/helpers');

module.exports = function(expect) {
    describe('checkActivities', function() {
        it('returns a list of activities IDs for proper slugs', function(done) {
            helpers.checkActivities(['docs', 'dev']).then(function(activities) {
                expect(activities).to.deep.equal([1, 2]);
                done();
            });
        });

        it('throws when passed undefined', function(done) {
            helpers.checkActivities(undefined).then().catch(function(err) {
                expect(err).to.be.a('null');
                done();
            });
        });

        it('throws when passed a list containing bad slugs', function(done) {
            helpers.checkActivities(['docs', 'dev', 'cats', 'dogs']).then()
            .catch(function(err) {
                err.sort();
                expect(err).to.deep.equal(['cats', 'dogs'].sort());
                done();
            });
        });

        it('throws when passed a list containing a null slug', function(done) {
            helpers.checkActivities(['docs', 'dev', null]).then()
            .catch(function(err) {
                expect(err).to.deep.equal([null]);
                done();
            });
        });
    });
};
