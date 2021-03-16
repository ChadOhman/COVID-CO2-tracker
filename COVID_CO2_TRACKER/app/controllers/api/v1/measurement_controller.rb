# frozen_string_literal: true

module Api
  module V1
    class MeasurementController < ApplicationController
      skip_before_action :authorized, only: [:show]
      def create
        # byebug
        @place = ::Place.find_by!(google_place_id: measurement_params[:google_place_id])

        # places_backend_api_key

        # https://discuss.rubyonrails.org/t/time-now-vs-time-current-vs-datetime-now/75183/15
        # ALSO, TODO: check to see if I should disable timezone conversion on backend?
        # https://discuss.rubyonrails.org/t/time-now-vs-time-current-vs-datetime-now/75183/15
        @new_measurement = ::Measurement.create!(device_id: measurement_params[:device_id], co2ppm: measurement_params[:co2ppm], measurementtime: ::Time.current, place_id: @place.id, crowding: measurement_params[:crowding], location_where_inside_info: measurement_params[:location_where_inside_info])

        render(
          json: {
            measurement_id: @new_measurement.id,
            device_id: @new_measurement.device.id,
            co2ppm: @new_measurement.co2ppm,
            place_id: @new_measurement.place,
            measurementtime: @new_measurement.measurementtime
          },
          status: :created
        )
      rescue ::ActiveRecord::RecordInvalid => e
        render(
          json: {
            errors: [create_activerecord_error('measurement creation failed!', e)]
          },
          status: :bad_request
        )
      end

      def show
        # TODO: what reaches this route?
        ::Rails.loggger.debug('What hit this route?')
        byebug
        @measurement = ::Measurement.find(measurement_params[:id])
        as_json_result = ::Measurement.measurement_with_device_place_as_json(@measurement)
        render(
          json: as_json_result,
          status: :ok
        )
      rescue ::ActiveRecord::RecordNotFound => e
        render(
          json: {
            errors: [create_activerecord_error('measurement not found!', e)]
          },
          status: :not_found
        )
      end

      def measurement_params
        params.require(:measurement).permit(:id, :device_id, :co2ppm, :measurementtime, :google_place_id, :crowding, :location_where_inside_info)
      end
    end
  end
end
