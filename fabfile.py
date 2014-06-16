from fabric.api import *

prod_server = 'thevariable@thevariable.webfactional.com'
bitbucket_repo = 'https://bitbucket.org/pbeeson_thevariable/share-the-sunshine'
virtualenv = 'sharethesunshine'


def prod():
    env.hosts = [prod_server]
    env.remote_app_dir = '$HOME/webapps/sharethesunshine/sharethesunshine'
    env.remote_apache_dir = '$HOME/webapps/sharethesunshine/apache2'


def commit():
    message = raw_input("Enter a git commit message:  ")
    local("git add -A && git commit -m \"%s\"" % message)
    local("git push origin master")
    print "Changes have been pushed to remote repository..."


def restart():
    with prefix('workon %s' % virtualenv):
        require('hosts', provided_by=[prod])
        require('remote_apache_dir', provided_by=[prod])
        run('%s/bin/restart' % (env.remote_apache_dir))
    print 'Apache has been restarted'


def deploy():
    with prefix('workon %s' % virtualenv):
        require('hosts', provided_by=[prod])
        require('remote_app_dir', provided_by=[prod])
        #commit()
        run("cd %s; git pull" % env.remote_app_dir)
    print 'Code has been deployed to production'
