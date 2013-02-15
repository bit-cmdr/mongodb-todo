// Generated by CoffeeScript 1.3.3
(function() {
  var methodMap;

  methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };

  Backbone.sync = function(method, model, options) {
    var beforeSend, error, params, success, type, xhr;
    type = methodMap[method];
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });
    params = {
      type: type,
      dataType: 'json'
    };
    if (!options.url) {
      params.url = _.result(model, 'url' || urlError());
    }
    if (options.data === null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {
        model: params.data
      } : {};
    }
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) {
        params.data._method = type;
      }
      beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) {
          return beforeSend.apply(this, arguments);
        }
      };
    }
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }
    success = options.success;
    options.success = function(resp, status, xhr) {
      if (success) {
        success(resp, status, xhr);
      }
      return model.trigger('sync', model, resp, options);
    };
    error = options.error;
    options.error = function(xhr, status, thrown) {
      if (error) {
        error(model, xhr, options);
      }
      return model.trigger('error', model, xhr, options);
    };
    xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

}).call(this);
