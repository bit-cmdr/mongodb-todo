define [
	'underscore'
	'backbone'
], (_, Backbone) ->
	class BaseModel extends Backbone.Model

	class User extends BaseModel
		urlRoot: '/api/users'
		defaults:
			name: ''
			tasksUrl: ''

		updateName: (newName) ->
			@set
				name: newName

	class Todo extends BaseModel
		urlRoot: ->
			"/api/users/#{@get('userId')}/tasks/#{@get('id')}"
		defaults:
			description: ''
			completed: false
			userId: ''

		initialize: (options) ->
			if options?.urlRoot
				@urlRoot = ->
					options.urlRoot
			@set 'userId', options.userId if options?.userId
			super()

		updateDescription: (newDescription) ->
			@set 'description', newDescription
			return

		toggle: ->
			@save 'completed', not @get 'completed'
			return

	{
		User: User
		Todo: Todo
	}