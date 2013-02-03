// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jquery', 'underscore', 'backbone', 'models', 'collections'], function($, _, Backbone, Models, Collections) {
    var BaseView, TodoList, TodoView, ToolbarView, UserView;
    BaseView = (function(_super) {

      __extends(BaseView, _super);

      BaseView.prototype.subviews = [];

      function BaseView(options) {
        this.subviews = [];
        BaseView.__super__.constructor.call(this, options);
      }

      BaseView.prototype.remove = function() {
        this.trigger('removed', this);
        this.removeSubViews();
        this.$el.fadeOut('fast', function() {
          $(this).remove();
        });
        return BaseView.__super__.remove.call(this);
      };

      BaseView.prototype.addSubView = function(view, insertMethod, targetSelector) {
        if (insertMethod == null) {
          insertMethod = 'append';
        }
        if (targetSelector == null) {
          targetSelector = null;
        }
        this.subviews.push(view);
        view.on('removed', this._removeSubView, this);
        if (!targetSelector) {
          this.$el[insertMethod](view.render().el);
        } else {
          this.$el.find(targetSelector)[insertMethod](view.render().el);
        }
        return this;
      };

      BaseView.prototype.removeSubViews = function() {
        _.invoke(this.subviews, 'remove');
        this.subviews = [];
      };

      BaseView._removeSubView = function(view) {
        this.subviews = _.without(this.subviews, view);
      };

      return BaseView;

    })(Backbone.View);
    ToolbarView = (function(_super) {
      var _ref;

      __extends(ToolbarView, _super);

      function ToolbarView() {
        return ToolbarView.__super__.constructor.apply(this, arguments);
      }

      ToolbarView.prototype.template = Handlebars.compile((_ref = $('#toolbar-template').html()) != null ? _ref : '');

      ToolbarView.prototype.events = {
        'click #create-user': 'addUser',
        'change #select-user': 'selectUser',
        'click #save': 'save'
      };

      ToolbarView.prototype.initialize = function(options) {
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'change', this.render);
        return ToolbarView.__super__.initialize.call(this, options);
      };

      ToolbarView.prototype.render = function() {
        this.removeSubViews();
        this.$el.html(this.template(this.collection.toJSON()));
        return ToolbarView.__super__.render.call(this);
      };

      ToolbarView.prototype.addUser = function() {
        this.trigger('users:add');
      };

      ToolbarView.prototype.setUser = function(userId) {
        this.$el.find("#select-user > option[value=" + userId + "]").attr('selected', 'selected');
      };

      ToolbarView.prototype.selectUser = function(ev) {
        this.trigger('users:select', this.collection.get($(ev.target).val()));
      };

      ToolbarView.prototype.save = function() {
        this.trigger('save-all');
      };

      ToolbarView.prototype.toggleNew = function(allow) {
        if (allow === true) {
          $('#add-user').enable();
        } else {
          $('#add-user').disable();
        }
      };

      return ToolbarView;

    })(BaseView);
    UserView = (function(_super) {
      var _ref;

      __extends(UserView, _super);

      function UserView() {
        return UserView.__super__.constructor.apply(this, arguments);
      }

      UserView.prototype.template = Handlebars.compile((_ref = $('#user-template').html()) != null ? _ref : '');

      UserView.prototype.events = {
        'keyup #user-name': 'updateUserName',
        'click #save-user': 'saveUser'
      };

      UserView.prototype.initialize = function(options) {
        if (options != null ? options.model : void 0) {
          this.model = options.model;
          if (this.model.get('tasksUrl')) {
            this.tasks = new Collections.Todos({
              url: this.model.get('tasksUrl')
            });
            this.listenTo(this.tasks, 'reset', this.renderList);
            this.tasks.fetch();
          }
        }
        return UserView.__super__.initialize.call(this, options);
      };

      UserView.prototype.render = function() {
        this.removeSubViews();
        if (this.model) {
          this.$el.html(this.template(this.model.toJSON()));
        } else {
          this.$el.html(this.template());
        }
        return UserView.__super__.render.call(this);
      };

      UserView.prototype.renderList = function() {
        var list;
        list = new TodoList({
          collection: this.tasks,
          model: this.model
        });
        this.addSubView(list);
      };

      UserView.prototype.updateUserName = function(ev) {
        this.model.updateName($(ev.target).val());
      };

      UserView.prototype.saveUser = function(ev) {
        if (ev != null ? ev.preventDefault : void 0) {
          ev.preventDefault();
        }
        this.model.save();
      };

      return UserView;

    })(BaseView);
    TodoList = (function(_super) {
      var _ref;

      __extends(TodoList, _super);

      function TodoList() {
        return TodoList.__super__.constructor.apply(this, arguments);
      }

      TodoList.prototype.template = Handlebars.compile((_ref = $('#todo-list-template').html()) != null ? _ref : '');

      TodoList.prototype.initialize = function(options) {
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        return TodoList.__super__.initialize.call(this, options);
      };

      TodoList.prototype.render = function() {
        this.$el.html(this.template());
        this.renderRows();
        return TodoList.__super__.render.call(this);
      };

      TodoList.prototype.renderRows = function() {
        var view,
          _this = this;
        this.removeSubViews();
        console.log(this.collection);
        this.collection.each(function(model) {
          var view;
          view = new TodoView({
            model: model
          });
          _this.addSubView(view, 'append', 'ul');
        });
        view = new TodoView({
          model: new Models.Todo({
            urlRoot: this.collection.url,
            userId: this.model.id
          })
        });
        this.addSubView(view, 'append', 'ul');
        this.listenTo(view, 'add-task', function(todo) {
          _this.collection.add(todo);
        });
      };

      return TodoList;

    })(BaseView);
    TodoView = (function(_super) {
      var _ref;

      __extends(TodoView, _super);

      function TodoView() {
        return TodoView.__super__.constructor.apply(this, arguments);
      }

      TodoView.prototype.template = Handlebars.compile((_ref = $('#todo-template').html()) != null ? _ref : '');

      TodoView.prototype.events = {
        'keyup input.description': 'updateDescription',
        'click input[type=checkbox]': 'toggleComplete',
        'keyup input[type=checkbox]': 'toggleComplete',
        'click .add-task': 'addTask'
      };

      TodoView.prototype.initialize = function(options) {
        this.listenTo(this.model, 'change:completed', this.render);
        return TodoView.__super__.initialize.call(this, options);
      };

      TodoView.prototype.render = function() {
        this.removeSubViews();
        this.$el.html(this.template(this.model.toJSON()));
        return TodoView.__super__.render.call(this);
      };

      TodoView.prototype.updateDescription = function(ev) {
        console.log($(ev.target).val());
        this.model.updateDescription($(ev.target).val());
      };

      TodoView.prototype.addTask = function(ev) {
        if (ev != null ? ev.preventDefault : void 0) {
          ev.preventDefault();
        }
        this.model.save();
      };

      TodoView.prototype.toggleComplete = function() {
        this.model.toggle();
      };

      return TodoView;

    })(BaseView);
    return {
      ToolbarView: ToolbarView,
      UserView: UserView
    };
  });

}).call(this);
