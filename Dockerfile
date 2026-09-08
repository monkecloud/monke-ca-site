# The site is baked into the image, so content is versioned with the code and a deploy is
# one new tag. Nothing is fetched at runtime.
#
# Unprivileged nginx runs as uid 101 and listens on 8080 — which is what the Deployment
# expects, and what keeps the pod inside the cluster's `restricted` Pod Security profile
# rather than only `baseline`.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# root only for the copy and the cleanup; the image drops back to uid 101 to run.
USER root
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx . /usr/share/nginx/html
# The config would otherwise be served from the web root. Deliberately not done with a
# heredoc: that needs BuildKit, and this has to build the same way everywhere.
RUN rm -f /usr/share/nginx/html/nginx.conf
USER 101
