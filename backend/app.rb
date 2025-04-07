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

      # Apply employee name filter if provided
      if employee_name_filter && !employee_name_filter.empty?
        employees = employees.where("lower(first_name) LIKE ? OR lower(last_name) LIKE ?", "%#{employee_name_filter}%", "%#{employee_name_filter}%")
      end

      # Apply sorting if provided
      if params[:sort]
        if params[:sort].start_with?('-')
          sort_direction = 'desc'
          # remove the first character from the sort parameter to get the column name
          sort_column = params[:sort][1..-1]
        else
          sort_direction = 'asc'
          sort_column = params[:sort]
        end
          employees = employees.order("#{sort_column} #{sort_direction}")
      end

      # Apply pagination
      if params[:page]
        page_number = (params.dig(:page, :number) || 1).to_i
        page_size = (params.dig(:page, :size) || 10).to_i
        employees = employees.page(page_number).per(page_size)
      end

      status 200
      content_type :jsonapi
      employees.to_json(include: [:department], meta: { total_pages: employees.total_pages, current_page: page_number })
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
    employees = Employee.where("lower(first_name) LIKE ? OR lower(last_name) LIKE ?", "%#{search_term}%", "%#{search_term}%")
  
    # Apply sorting if provided
    if params[:sort]
      if params[:sort].start_with?('-')
        sort_direction = 'desc'
        sort_column = params[:sort][1..-1] # Remove the leading '-' for the column name
      else
        sort_direction = 'asc'
        sort_column = params[:sort]
      end
      employees = employees.order("#{sort_column} #{sort_direction}")
    end
  
    # Apply pagination
    if params[:page]
      page_number = (params.dig(:page, :number) || 1).to_i
      page_size = (params.dig(:page, :size) || 10).to_i
      employees = employees.page(page_number).per(page_size)
    end
  
    if employees.any?
      status 200
      content_type :jsonapi
      employees.to_json(include: [:department], meta: { total_pages: employees.total_pages, current_page: page_number })
    else
      status 404
      content_type :jsonapi
      { errors: [{ status: '404', title: 'No Employees Found' }] }.to_json
    end
  end

  # Add a new employee
  # Example: POST /api/v1/employees
  # Request body: { "first_name": "John", "last_name": "Doe", "age": 30, "position": "Developer", "department_id": 1 }
  # Response: 201 Created
  # Response: 409 Conflict with department, first_name and last_name
  post '/api/v1/employees' do
    request_payload = JSON.parse(request.body.read)

    first_name = request_payload['first_name']
    last_name = request_payload['last_name']
    age = request_payload['age']
    position = request_payload['position']
    department_id = request_payload['department_id']

    # Check if an employee with the same first and last name exists in the same department
    existing_employee = Employee.where(
      first_name: first_name,
      last_name: last_name,
      department_id: department_id
    ).first

    if existing_employee
      status 409
      content_type :json
      { error: 'An employee with the same first and last name already exists in this department.' }.to_json
    else
      # Create the new employee
      new_employee = Employee.create(
        first_name: first_name,
        last_name: last_name,
        age: age,
        position: position,
        department_id: department_id
      )

      if new_employee.persisted?
        status 201
        content_type :json
        new_employee.to_json(include: [:department])
      else
        status 422
        content_type :json
        { error: 'Failed to create the employee.', details: new_employee.errors.full_messages }.to_json
      end
    end
  end
end
