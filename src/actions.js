//const { Regex } = require('@companion-module/base')
const { paramSep, addrSep, nullParam, SOM, control, appTag } = require('./consts.js')

module.exports = function (self) {
	self.setActionDefinitions({
		crosspoint_set: {
			name: 'Crosspoint - Set',
			description: 'Set a crosspoint connection',
			options: [
				{
					id: 'src',
					type: 'dropdown',
					label: 'sources',
					default: 1,
					choices: self.sources,
					useVariables: true,
					allowCustom: true,
					tooltip: 'Varible must return an integer channel number',
				},
				{
					id: 'dst',
					type: 'dropdown',
					label: 'Destination',
					default: 1,
					choices: self.destinations,
					useVariables: true,
					allowCustom: true,
					tooltip: 'Varible must return an integer channel number',
				},
				{
					id: 'addr',
					type: 'textinput',
					label: 'Address',
					default: self.config.address,
					useVariables: true,
					tooltip: 'Varible must return an string of 0 to 6 characters',
				},
				{
					id: 'method',
					type: 'dropdown',
					label: 'Method',
					choices: self.crosspoint_method,
					default: control.reqSet,
					allowCustom: false,
				},
			],
			callback: async ({ options }) => {
				let dst = parseInt(await self.parseVariablesInString(options.dst))
				let addr = self.regexAddress(await self.parseVariablesInString(options.addr))
				let cmd = ''
				if (isNaN(dst) || dst > self.config.destinations) {
					self.log('warn', `an invalid dst varible has been passed: ${dst}`)
					return undefined
				}
				if (options.method == control.reqSet) {
					cmd = SOM + control.reqSet + appTag.crosspoint + dst + paramSep
					let src = parseInt(await self.parseVariablesInString(options.src))
					if (isNaN(src) || src > self.config.sources) {
						self.log('warn', `an invalid src varible has been passed: ${src} `)
						return undefined
					}
					cmd += src + addrSep + addr
				} else if (options.method == control.reqReset) {
					cmd = SOM + control.reqSet + appTag.crosspoint + dst + paramSep + '0' + addrSep + addr
				} else {
					cmd = SOM + control.reqInterrogate + appTag.crosspoint + dst + paramSep + nullParam + addrSep + addr
				}
				self.addCmdtoQueue(cmd)
			},
			learn: async (action) => {
				let dst = parseInt(await self.parseVariablesInString(action.options.dst))
				if (isNaN(dst) || dst > self.config.destinations) {
					self.log('warn', `an invalid varible has been passed: ${dst}`)
					return undefined
				}
				const source = self.connections[dst]
				return {
					...action.options,
					src: source,
				}
			},
			subscribe: async (action) => {
				let cmd = SOM + control.reqInterrogate + appTag.crosspoint
				let dst = parseInt(await self.parseVariablesInString(action.options.dst))
				if (isNaN(dst) || dst > self.config.destinations) {
					self.log('warn', `an invalid varible has been passed: ${dst}`)
					return undefined
				}
				cmd += dst + paramSep + nullParam
				self.addCmdtoQueue(cmd)
			},
		},
	})
}
