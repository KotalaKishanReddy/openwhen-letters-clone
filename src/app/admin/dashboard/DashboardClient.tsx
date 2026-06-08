'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Eye, Edit3, Trash2, Share2, Globe, Lock,
  BarChart2, LogOut, X, Loader2, Scissors
} from 'lucide-react'
import type { Collection } from '@/lib/types'
import { CARD_COLORS, FONT_OPTIONS } from '@/lib/utils'

const COVER_PRESETS = [
  { color: '#faf6ef', label: 'Paper' },
  { color: '#f7c5d0', label: 'Blush' },
  { color: '#fef3c7', label: 'Butter' },
  { color: '#d4c5e8', label: 'Lilac' },
  { color: '#b8d4c0', label: 'Sage' },
  { color: '#b8d8e8', label: 'Sky' },
  { color: '#f0d9b5', label: 'Kraft' },
  { color: '#2c1a0e', label: 'Ink' },
]

const EMOJI_QUICK = ['📸','✂️','📓','🎀','🌻','🎶','🏖️','❤️','🌟','🎁','🦋','🌈']

interface NewColForm {
  title: string
  recipient_name: string
  description: string
  cover_emoji: string