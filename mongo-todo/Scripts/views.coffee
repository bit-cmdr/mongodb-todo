define [
	'jquery'
	'underscore'
	'backbone'
	'models'
	'collections'
], ($, _, Backbone, Models, Collections) ->
	class BaseView extends Backbone.View
		subviews: []

		constructor: (options) ->
			@subviews = []
			super options

		remove: ->
			@trigger 'removed', @
			@removeSubViews()
			@$el.fadeOut 'fast', ->
				$(@).remove()
				return
			super()

		addSubView: (view, insertMethod = 'append', targetSelector = null) ->
			@subviews.push view
			view.on 'removed', @_removeSubView, @
			unless targetSelector then @$el[insertMethod] view.render().el
			else @$el.find(targetSelector)[insertMethod] view.render().el
			@ # we return this to allow chaining

		removeSubViews: ->
			_.invoke @subviews, 'remove'
			@subviews = []
			return

		@_removeSubView: (view) ->
			@subviews = _.without @subviews, view
			return

	class ToolbarView extends BaseView
		template: Handlebars.compile $('#toolbar-template').html() ? ''
		events:
			'click #create-user': 'addUser'
			'change #select-user': 'selectUser'
			'click #save': 'save'

		initialize: (options) ->
			@listenTo @collection, 'reset', @render
			@listenTo @collection, 'add', @render
			@listenTo @collection, 'remove', @render
			@listenTo @collection, 'change', @render
			super options

		render: ->
			@removeSubViews()
			@$el.html @template @collection.toJSON()
			super()

		addUser: ->
			@trigger 'users:add'
			return

		selectUser: (ev) ->
			@trigger 'users:select', @collection.get $(ev.target).val()
			return

		save: ->
			@trigger 'save-all'
			return

		toggleNew: (allow) ->
			if allow is true then $('#add-user').enable()
			else $('#add-user').disable()
			return

	class UserView extends BaseView
		template: Handlebars.compile $('#user-template').html() ? ''
		events:
			'keyup #user-name': 'updateUserName'

		initialize: (options) ->
			if options?.model
				@model = options.model
				@listenTo @model, 'change', @render
				if @model.get('tasksUrl')
					@tasks = new Collections.Todos url: @model.get('tasksUrl')
					@listenTo @tasks, 'reset', @renderList
					@tasks.fetch()
			super options

		render: ->
			@removeSubViews()
			if @model then @$el.html @template @model.toJSON() else @$el.html @template()
			super()

		renderList: ->
			if @tasks?.length
				list = new TodoList collection: @tasks
				@addSubView list
			return

		updateUserName: (ev) ->
			@model.updateName $(ev.target).val()
			return

	class TodoList extends BaseView
		template: Handlebars.compile $('#todo-list-template').html() ? ''

		initialize: (options) ->
			@listenTo @collection, 'reset', @render
			@listenTo @collection, 'add', @render
			@listenTo @collection, 'remove', @render
			super options

		render: ->
			@$el.html @template()
			@renderRows()
			super()

		renderRows: ->
			@removeSubViews()
			@collection.filter (model) =>
				view = new TodoView model: model
				@addSubView view, 'append', 'ul'
				return
			return

	class TodoView extends BaseView
		template: Handlebars.compile $('#todo-template').html() ? ''
		events:
			'keyup input[type=text]': 'updateDescription'
			'click input[type=checkbox]': 'toggleComplete'
			'keyup input[type=checkbox]': 'toggleComplete'

		initialize: (options) ->
			@listenTo @model, 'change', @render
			super options

		render: ->
			@removeSubViews()
			@$el.html @template @model.toJSON()
			super()

		updateDescription: (ev) ->
			@model.updateDescription $(ev.target).val()
			return

		toggleComplete: ->
			@model.toggle()
			return

	{
		ToolbarView: ToolbarView
		UserView: UserView
	}