class SquashDec112021 < ActiveRecord::Migration[6.1]
  def change

    create_table "active_admin_comments" do |t|
      t.string "namespace"
      t.text "body"
      t.string "resource_type"
      t.bigint "resource_id"
      t.string "author_type"
      t.bigint "author_id"
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author"
      t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
      t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource"
    end
  
    create_table "admin_users" do |t|
      t.string "email", default: "", null: false
      t.string "encrypted_password", default: "", null: false
      t.string "reset_password_token"
      t.datetime "reset_password_sent_at"
      t.datetime "remember_created_at"
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["email"], name: "index_admin_users_on_email", unique: true
      t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
    end
  
    # create_table "device_models", force: :cascade do |t|
    #   t.string "name"
    #   t.integer "manufacturer_id", null: false
    #   t.datetime "created_at", precision: 6, null: false
    #   t.datetime "updated_at", precision: 6, null: false
    #   t.index ["manufacturer_id"], name: "index_device_models_on_manufacturer_id"
    # end
  
    create_table "devices" do |t|
      t.string "serial", null: false
      t.bigint "model_id", null: false
      t.bigint "user_id", null: false
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["model_id"], name: "index_devices_on_model_id"
      t.index ["user_id"], name: "index_devices_on_user_id"
    end
  
    create_table "manufacturers" do |t|
      t.string "name", null: false
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["name"], name: "index_manufacturers_on_name", unique: true
    end
  
    create_table "measurements" do |t|
      t.bigint "device_id", null: false
      t.integer "co2ppm", null: false
      t.datetime "measurementtime", null: false
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.integer "crowding", null: false
      t.bigint "sub_location_id"
      t.index ["device_id"], name: "index_measurements_on_device_id"
      t.index ["measurementtime"], name: "index_measurements_on_measurementtime"
      t.index ["sub_location_id"], name: "index_measurements_on_sub_location_id"
    end
  
    create_table "models" do |t|
      t.string "name", null: false
      t.bigint "manufacturer_id", null: false
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["manufacturer_id"], name: "index_models_on_manufacturer_id"
    end
  
    create_table "places" do |t|
      t.string "google_place_id", null: false
      t.datetime "last_fetched", null: false
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.decimal "place_lat", precision: 10, scale: 6
      t.decimal "place_lng", precision: 10, scale: 6
      t.index ["google_place_id"], name: "index_places_on_google_place_id", unique: true
      t.index ["place_lat"], name: "index_places_on_place_lat"
      t.index ["place_lng"], name: "index_places_on_place_lng"
    end
  
    create_table "sub_locations" do |t|
      t.string "description", null: false
      t.bigint "place_id", null: false
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["place_id"], name: "index_sub_locations_on_place_id"
    end
  
    create_table "users" do |t|
      t.string "email"
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.string "name"
      t.string "sub_google_uid"
      t.index ["email"], name: "index_users_on_email", unique: true
      t.index ["sub_google_uid"], name: "index_users_on_sub_google_uid", unique: true
    end
  
    # add_foreign_key "device_models", "manufacturers"
    add_foreign_key "devices", "models"
    add_foreign_key "devices", "users"
    add_foreign_key "measurements", "devices"
    add_foreign_key "measurements", "sub_locations"
    add_foreign_key "models", "manufacturers"
    add_foreign_key "sub_locations", "places"
  
  end
end
