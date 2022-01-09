# frozen_string_literal: true

Sentry.init do |config|
  # No more sentry hits for Alexander :)
  config.dsn = 'https://225ac505333449efad94c958dd3c2888@o1111351.ingest.sentry.io/6140622'
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # To activate performance monitoring, set one of these options.
  # We recommend adjusting the value in production:
  config.traces_sample_rate = 1.0
  # or
  # config.traces_sampler = lambda do |context|
  #   true
  # end

  # https://docs.sentry.io/platforms/ruby/guides/rails/configuration/options/
  config.async = lambda do |event, hint|
    Sentry::SendEventJob.perform_later(event, hint)
  end
end
