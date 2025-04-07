require 'faker'
require 'active_record'
require './seeds'
require 'kaminari'
require 'sinatra/base'
require 'graphiti'
require 'graphiti/adapters/active_record'

class ApplicationResource < Graphiti::Resource
  self.abstract_class = true
  self.adapter = Graphiti::Adapters::ActiveRecord
  self.base_url = 'http://localhost:4567'
  self.endpoint_namespace = '/api/v1'
  # implement Graphiti.config.context_for_endpoint for validation
  self.validate_endpoints = false
end

class DepartmentResource < ApplicationResource
  self.model = Department
  self.type = :departments

  attribute :name, :string
  
  has_many :employees
end

# Add the employee ressouce
class EmployeeResource < ApplicationResource
  self.model = Employee
  self.type = :employees

  attribute :first_name, :string
  attribute :last_name, :string
  attribute :age, :integer
  attribute :position, :string
  attribute :department_id, :integer

  belongs_to :department
end

Graphiti.setup!

class EmployeeDirectoryApp < Sinatra::Application
  configure do
    mime_type :jsonapi, 'application/vnd.api+json'
  end

  before do
    content_type :jsonapi
  end

  after do
    ActiveRecord::Base.connection_handler.clear_active_connections!
  end

  get '/api/v1/departments' do
    departments = DepartmentResource.all(params)
    departments.to_jsonapi
  end

  get '/api/v1/departments/:id' do
    departments = DepartmentResource.find(params)
    departments.to_jsonapi
  end

  # Get employees by department name and filter by employee name
  # Example: /api/v1/departments/find/IT/employees
  # Example: /api/v1/departments/find/HR/employees?employee_name=john
  get '/api/v1/departments/find/:name/employees' do
    department_name = params[:name]
    employee_name_filter = params[:employee_name]&.downcase
    department = Department.find_by(name: department_name)

    if department
      employees = department.employees
      if employee_name_filter and !employee_name_filter.empty?
        employees = employees.where("lower(first_name) LIKE ? OR lower(last_name) LIKE ?", "%#{employee_name_filter}%", "%#{employee_name_filter}%")
      end
      status 200
      content_type :jsonapi
      employees.to_json(include: [:department])
    else
      status 404
      content_type :jsonapi
      { errors: [{ status: '404', title: 'Department Not Found' }] }.to_json
    end
  end

  # Get all employees
  get '/api/v1/employees' do
    employees = EmployeeResource.all(params)
    employees.to_json
  end

  # Get a list of employees filtered by first name or last name
  # Example: /api/v1/employees/find/john
  get '/api/v1/employees/find/:text' do
    search_term = params[:text].downcase
    @employees = Employee.where("lower(first_name) LIKE ? OR lower(last_name) LIKE ?", "%#{search_term}%", "%#{search_term}%")

    if @employees.present?
      status 200
      content_type :json
      @employees.to_json(include: [:department])
    else
      status 404
      content_type :json
      '{}'.to_json
    end
  end
end
