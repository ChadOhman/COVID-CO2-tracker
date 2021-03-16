# frozen_string_literal: true

class Device < ApplicationRecord
  belongs_to :model
  belongs_to :user
  # app/models/device.rb:7:3: C: Rails/HasManyOrHasOneDependent: Specify a :dependent option.
  has_many :measurement

  # TODO: should this be enforced in the database too?
  validates :serial, presence: true
  validates :model_id, presence: true
  validates :user_id, presence: true

  validates :user_id, uniqueness: { scope: :model_id, message: 'each device can only belong to single user!' }
end
